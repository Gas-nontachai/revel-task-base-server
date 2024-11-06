const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const {
  generateID,
  generateQuery,
  mapToCondition,
} = require("@/utils/db-helper")

Task.getNotifyRecipientBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_notify_recipient AS tb
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

Task.insertNotifyRecipient = (connection, data = {}) => new Promise((resolve, reject) => {
  const id = `NR${generateID()}`

  let sql = `INSERT INTO tb_notify_recipient (
    notify_recipient_id,
    notify_id,
    user_id,
    adddate
  ) VALUES (
    ${connection.escape(id)},
    ${connection.escape(data.notify_id)},
    ${connection.escape(data.user_id)},
    NOW()
  )
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateNotifyRecipientBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if ('notify_id' in data) condition = `AND notify_id = ${connection.escape(data.notify_id)} `
  if (data.notify_ids?.length) condition += `AND notify_id IN ('${data.notify_ids.join("','")}') `

  if (connection.session?._user) {
    condition += `AND user_id = ${connection.escape(connection.session?._user.user_id)}`
  }

  let sql = `UPDATE tb_notify_recipient SET
    is_seen = TRUE,
    seen_date = NOW()
    WHERE TRUE 
    ${condition}
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteNotifyRecipientBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if ('notify_id' in data) condition = `AND notify_id = ${connection.escape(data.notify_id)} `
  if (data.notify_ids?.length) condition += `AND notify_id IN ('${data.notify_ids.join("','")}') `

  if (connection.session?._user) {
    condition += `AND user_id = ${connection.escape(connection.session?._user.user_id)}`
  }

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_notify_recipient WHERE TRUE ${condition}`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task