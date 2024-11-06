const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateBookBankID = (connection) => new Promise((resolve, reject) => {
  let code = `BK${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(book_bank_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_book_bank
    WHERE book_bank_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getBookBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT bank_name
      FROM tb_bank
      WHERE bank_id = tb.bank_id
    ), '') AS bank_name
    FROM tb_book_bank AS tb
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

Task.getBookBankByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    IFNULL((
      SELECT bank_name
      FROM tb_bank
      WHERE tb_bank.bank_id = tb.bank_id
    ), '') AS bank_name
    FROM tb_book_bank AS tb
    WHERE book_bank_id = ${connection.escape(data.book_bank_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.getPaymentBookBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  const sql = `SELECT tb.*
    FROM tb_book_bank AS tb
    WHERE (book_bank_id IN (
      SELECT book_bank_id
      FROM tb_book_bank_branch
      WHERE branch_id = ${connection.escape(data.branch_id)}
    ) OR book_bank_id NOT IN (
      SELECT book_bank_id
      FROM tb_book_bank_branch
    ))
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.insertBookBank = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_book_bank (
    book_bank_id,
    bank_id,
    book_bank_number,
    book_bank_name,
    book_bank_detail,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.book_bank_id)},
    ${connection.escape(data.bank_id)},
    ${connection.escape(data.book_bank_number)},
    ${connection.escape(data.book_bank_name)},
    ${connection.escape(data.book_bank_detail)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateBookBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_book_bank SET 
    bank_id = ${connection.escape(data.bank_id)},
    book_bank_number = ${connection.escape(data.book_bank_number)},
    book_bank_name = ${connection.escape(data.book_bank_name)},
    book_bank_detail = ${connection.escape(data.book_bank_detail)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE book_bank_id = ${connection.escape(data.book_bank_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteBookBankBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_book_bank WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task