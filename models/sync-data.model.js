const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateSyncDataID = (connection) => new Promise((resolve, reject) => {
  let code = `SNCD${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(sync_data_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_sync_data
    WHERE sync_data_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getSyncDataBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_sync_data AS tb
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

Task.getSyncDataByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT * 
    FROM tb_sync_data 
    WHERE sync_data_id = ${connection.escape(data.sync_data_id)} `

  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.updateSyncDataFinishBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_sync_data SET 
    last_sync_time = ${connection.escape(data.last_sync_time)}
    WHERE sync_data_id = ${connection.escape(data.sync_data_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateSyncDataStatusBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_sync_data SET 
    sync_data_status = ${connection.escape(data.sync_data_status)}
    WHERE sync_data_id = ${connection.escape(data.sync_data_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.insertSyncData = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_sync_data (
    sync_data_id,
    branch_id,
    company_id,
    last_sync_time
  ) VALUES (
    ${connection.escape(data.sync_data_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.last_sync_time)}
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task