const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, grantAccessCompany, mapToCondition, } = require("@/utils/db-helper")

Task.generateCompanyID = (connection) => new Promise((resolve, reject) => {
  let code = `C${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(company_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_company
    WHERE company_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getCompanyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = ''

  data.match?.$sub?.forEach(item => {
    const { access } = item

    if (access) sub_condition += grantAccessCompany(connection)
  });

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_company AS tb
    WHERE TRUE
    ${condition}
    ${sub_condition}
    ${filter}
  `
  const count_query = `SELECT COUNT(*) AS total FROM (${core_query}) AS tb`

  if (data.count) return connection.query(count_query, function (err, res_total) {
    err ? reject(new Error(err.message)) : resolve(res_total[0].total)
  })

  connection.query(`${core_query} ${sort} ${pagination}`, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!pagination) return resolve({ docs: res, totalDocs: res.length })

    connection.query(count_query, function (err, res_total) {
      err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res_total[0].total })
    })
  })
})

Task.getCompanyByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT company_id,
    company_name,
    company_tel,
    company_address
    FROM tb_company AS tb
    WHERE company_id = ${connection.escape(data.company_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertCompany = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_company (
    company_id,
    company_name,
    company_tel,
    company_address,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.company_id)},
    ${connection.escape(data.company_name)},
    ${connection.escape(data.company_tel)},
    ${connection.escape(data.company_address)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateCompanyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_company SET 
    company_name = ${connection.escape(data.company_name)},
    company_tel = ${connection.escape(data.company_tel)},
    company_address = ${connection.escape(data.company_address)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE company_id = ${connection.escape(data.company_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteCompanyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_company WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;