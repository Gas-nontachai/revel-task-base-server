const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateSyncDataLogID = (connection) => new Promise((resolve, reject) => {
  let code = `SNCL${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(sync_data_log_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_sync_data_log
    WHERE sync_data_log_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getSyncDataLogBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_sync_data_log AS tb
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

Task.insertSyncDataLog = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_sync_data_log (
    sync_data_log_id,
    sync_data_id,
    sync_data_start_date,
    sync_data_end_date,
    sync_data_result,
    sync_data_error
  ) VALUES (
    ${connection.escape(data.sync_data_log_id)},
    ${connection.escape(data.sync_data_id)},
    ${connection.escape(formatDate(data.sync_data_start_date, 'yyyy-MM-dd HH:mm:ss'))},
    ${connection.escape(formatDate(data.sync_data_end_date, 'yyyy-MM-dd HH:mm:ss'))},
    ${connection.escape(data.sync_data_result)},
    ${connection.escape(data.sync_data_error)}
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteSyncDataLogBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_sync_data_log WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;