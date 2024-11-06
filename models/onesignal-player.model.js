const { formatDate } = require('@/utils/date-helper')
const { mapToCondition } = require("@/utils/db-helper")

const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

Task.getOnesignalPlayerBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  let sql = `SELECT tb.*
    FROM tb_onesignal_player AS tb
    WHERE TRUE
    ${condition}
    `
  connection.query(sql, function (err, res) {
    err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res.length })
  })
})

Task.getOnesignalPlayerByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    FROM tb_onesignal_player AS tb
    WHERE payment_id = ${connection.escape(data.payment_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertOnesignalPlayer = (connection, data = {}) => new Promise((resolve, reject) => {
  let _type = 'user_id'
  let _id = connection.session?._user[_type]

  let sql = `INSERT IGNORE INTO tb_onesignal_player (
    player_id,
    ${_type},
    subscription,
    last_active
  ) VALUES (
    ${connection.escape(data.player_id)},
    ${connection.escape(_id)},
    TRUE,
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateOnesignalPlayerBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_onesignal_player SET 
    subscription = ${connection.escape(data.subscription)},
    last_active = NOW()
    WHERE player_id = ${connection.escape(data.player_id)}`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateLastActiveBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_onesignal_player SET 
    last_active = NOW()
    WHERE player_id = ${connection.escape(data.player_id)}`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteOnesignalPlayerBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `DELETE FROM tb_onesignal_player WHERE player_id = ${connection.escape(data.player_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteInactivePlayer = (connection) => new Promise((resolve, reject) => {
  const expire_date = new Date();

  expire_date.setDate(expire_date.getDate() - 30);

  let sql = `DELETE FROM tb_onesignal_player WHERE last_active < STR_TO_DATE(${formatDate(expire_date, 'yyyy-MM-dd')}, '%Y-%m-%d') `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task