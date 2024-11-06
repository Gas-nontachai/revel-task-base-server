const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.getUserBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_user_branch AS tb
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

Task.insertUserBranch = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = ''
  data.user_branchs.forEach((item, idx) => {
    sql += `INSERT INTO tb_user_branch (
      user_branch_id,
      branch_id,
      user_id,
      addby,
      adddate
    ) VALUES (
      ${connection.escape(data.branch_id + "-" + idx)},
      ${connection.escape(data.branch_id)},
      ${connection.escape(item.user_id)},
      ${connection.escape(connection.session._id)},
      NOW()
    );`
  })

  if (!sql) return resolve([])

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteUserBranchBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_user_branch WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;