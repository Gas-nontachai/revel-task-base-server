const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const {
  generateID,
  generateQuery,
  mapToCondition,
} = require("@/utils/db-helper")

Task.getNotifyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let recipient_condition = ''
  let condition = mapToCondition(data)

  if (connection.session?._user) {
    recipient_condition += `AND user_id = ${connection.escape(connection.session?._user.user_id)}`
  }

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_notify AS tb
    WHERE TRUE
    ${condition}
    ${filter}
    `
  const count_query = `SELECT COUNT(*) AS total FROM (${core_query}) AS tb`

  if (data.count) return connection.query(count_query, function (err, res_total) {
    err ? reject(new Error(err.message)) : resolve(res_total[0].total)
  })

  connection.query(`${core_query} ${sort || 'ORDER BY adddate DESC'} ${pagination}`, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!pagination) return resolve({ docs: res, totalDocs: res.length })

    connection.query(count_query, function (err, res_total) {
      err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res_total[0].total })
    })
  })
})

Task.getMyNotifyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let recipient_condition = ''
  let condition = mapToCondition(data)

  if (connection.session?._user) {
    recipient_condition += `AND user_id = ${connection.escape(connection.session?._user.user_id)}`
  }

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT is_seen
      FROM tb_notify_recipient
      WHERE notify_id = tb.notify_id 
      ${recipient_condition} 
    ), FALSE) AS is_seen
    FROM tb_notify AS tb
    WHERE notify_id IN (
      SELECT notify_id
      FROM tb_notify_recipient
      WHERE TRUE 
      ${recipient_condition}
    )
    ${condition}
    ${filter}
    `
  const count_query = `SELECT COUNT(*) AS total FROM (${core_query}) AS tb`

  if (data.count) return connection.query(count_query, function (err, res_total) {
    err ? reject(new Error(err.message)) : resolve(res_total[0].total)
  })

  connection.query(`${core_query} ${sort || 'ORDER BY adddate DESC'} ${pagination}`, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!pagination) return resolve({ docs: res, totalDocs: res.length })

    connection.query(count_query, function (err, res_total) {
      err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res_total[0].total })
    })
  })
})

Task.insertNotify = (connection, data = {}) => new Promise((resolve, reject) => {
  const id = `N${generateID()}`

  let sql = `INSERT INTO tb_notify (
    notify_id,
    notify_title,
    notify_detail,
    notify_url,
    notify_lv,
    adddate
  ) VALUES (
    ${connection.escape(id)},
    ${connection.escape(data.notify_title)},
    ${connection.escape(data.notify_detail)},
    ${connection.escape(data.notify_url)},
    ${connection.escape(data.notify_lv)},
    now()
  )
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve({ ...res, data: id }) })
})

Task.deleteNotifyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_notify WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task