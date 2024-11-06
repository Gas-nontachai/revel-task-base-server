const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateLicenseID = (connection) => new Promise((resolve, reject) => {
  let code = `L${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 3

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(license_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
		FROM tb_license
		WHERE license_id LIKE (${connection.escape(`${code}%`)}) 
	`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getLicenseBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_license AS tb
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

Task.getLicenseByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.* 
    FROM tb_license AS tb
    WHERE license_id = ${connection.escape(data.license_id)}
  `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertLicense = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_license (
    license_id,
    license_name, 
    license_all_branch,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.license_id)},
    ${connection.escape(data.license_name)},
    ${connection.escape(data.license_all_branch)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateLicenseBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_license SET
    license_name = ${connection.escape(data.license_name)},
    license_all_branch = ${connection.escape(data.license_all_branch)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE license_id = ${connection.escape(data.license_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteLicenseBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_license WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task