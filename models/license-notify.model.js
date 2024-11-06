const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { mapToCondition } = require('@/utils/db-helper')

Task.getLicenseNotifyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.notify_event_id,
    notify_event_group,
    notify_event_name,
    notify_event_key,
    is_email_active,
    is_notify_active
    FROM tb_notify_event AS tb
    LEFT JOIN tb_license_notify ON tb.notify_event_id = tb_license_notify.notify_event_id AND license_id = ${connection.escape(data.license_id || '')}
    ORDER BY notify_event_group, tb.notify_event_id
    `
  connection.query(sql, function (err, res) {
    err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res.length })
  })
})

Task.insertLicenseNotify = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = ''

  data.license_notifys.forEach((item, idx) => {
    sql += `INSERT INTO tb_license_notify (
      license_id,
      notify_event_id,
      is_email_active,
      is_notify_active
    ) VALUES (
      ${connection.escape(data.license_id)},
      ${connection.escape(item.notify_event_id)},
      ${connection.escape(item.is_email_active)}
      ${connection.escape(item.is_notify_active)}
    );`
  })

  if (!sql) return resolve([])

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteLicenseNotifyBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_license_notify WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;