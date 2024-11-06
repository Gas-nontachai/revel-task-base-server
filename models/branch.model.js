const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, grantAccessBranch, mapToCondition } = require("@/utils/db-helper")

Task.generateBranchID = (connection) => new Promise((resolve, reject) => {
  let code = `B${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(branch_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_branch
    WHERE branch_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = ''

  data.match?.$sub?.forEach(item => {
    const { access } = item

    if (access) sub_condition += grantAccessBranch(connection)
  });

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT company_name
      FROM tb_company
      WHERE tb_company.company_id = tb.company_id
    ), tb.company_id) AS company_name
    FROM tb_branch AS tb
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

Task.getBranchByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT branch_id,
    company_id,
    branch_name,
    branch_tel,
    branch_address,
    IFNULL((
      SELECT company_name
      FROM tb_company
      WHERE tb_company.company_id = tb.company_id
    ), tb.company_id) AS company_name
    FROM tb_branch AS tb
    WHERE branch_id = ${connection.escape(data.branch_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertBranch = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_branch (
    branch_id,
    company_id,
    branch_name,
    branch_tel,
    branch_address,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.branch_name)},
    ${connection.escape(data.branch_tel)},
    ${connection.escape(data.branch_address)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_branch SET 
    company_id = ${connection.escape(data.company_id)},
    branch_name = ${connection.escape(data.branch_name)},
    branch_tel = ${connection.escape(data.branch_tel)},
    branch_address = ${connection.escape(data.branch_address)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE branch_id = ${connection.escape(data.branch_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_branch WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;