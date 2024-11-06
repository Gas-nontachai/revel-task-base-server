const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.getBookBankBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_book_bank_branch AS tb
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

Task.insertBookBankBranch = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = ''
  data.book_bank_branchs.forEach((item, idx) => {
    sql += `INSERT INTO tb_book_bank_branch (
      book_bank_branch_id,
      book_bank_id,
      branch_id
    ) VALUES (
      ${connection.escape(data.book_bank_id + "-" + idx)},
      ${connection.escape(data.book_bank_id)},
      ${connection.escape(item.branch_id)}
    );`
  })

  if (!sql) return resolve([])

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteBookBankBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_book_bank_branch WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;