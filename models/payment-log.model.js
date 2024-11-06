const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const {
  generateID,
  generateQuery,
  mapToCondition,
} = require("@/utils/db-helper")

Task.getPaymentLogBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_payment_log AS tb
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

Task.insertPaymentLog = (connection, data = {}) => new Promise((resolve, reject) => {
  const id = generateID()

  let sql = `INSERT INTO tb_payment_log (
    payment_log_id,
    payment_id,
    payment_log_text,
    payment_log_event,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(id)},
    ${connection.escape(data.payment_id)},
    ${connection.escape(data.payment_log_text)},
    ${connection.escape(data.payment_log_event)},
    ${connection.escape(connection.session._id)},
    NOW()
  ) `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deletePaymentLogBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_payment_log WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task