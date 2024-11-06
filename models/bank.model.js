const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateBankID = (connection) => new Promise((resolve, reject) => {
  let code = `B${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(bank_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_bank
    WHERE bank_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_bank AS tb
    WHERE TRUE
    ${condition}
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

Task.getBankByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*
    FROM tb_bank AS tb
    WHERE bank_id = ${connection.escape(data.bank_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertBank = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_bank (
    bank_id,
    bank_name,
    bank_detail,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.bank_id)},
    ${connection.escape(data.bank_name)},
    ${connection.escape(data.bank_detail)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_bank SET 
    bank_name = ${connection.escape(data.bank_name)},
    bank_detail = ${connection.escape(data.bank_detail)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE bank_id = ${connection.escape(data.bank_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `DELETE 
    FROM tb_bank 
    WHERE bank_id = ${connection.escape(data.bank_id)} 
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task