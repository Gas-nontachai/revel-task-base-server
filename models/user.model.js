const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateUserID = (connection) => new Promise((resolve, reject) => {
  let code = `U${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(user_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_user
    WHERE user_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getUserBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT user_id,
    license_id,
    user_prefix,
    user_firstname,
    user_lastname,
    user_img,
    user_email,
    user_tel,
    user_username,
    user_address,
    user_status,
    CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname) AS user_fullname,
    IFNULL((
      SELECT license_name
      FROM tb_license 
      WHERE license_id = tb.license_id
    ), tb.license_id) AS license_name
    FROM tb_user AS tb
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

Task.getUserByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT user_id,
    license_id,
    user_prefix,
    user_firstname,
    user_lastname,
    user_img,
    user_email,
    user_tel,
    user_username,
    user_address,
    user_status,
    CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname) AS user_fullname,
    IFNULL((
      SELECT license_name
      FROM tb_license 
      WHERE license_id = tb.license_id
    ), tb.license_id) AS license_name
    FROM tb_user AS tb
    WHERE user_id = ${connection.escape(data.user_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.getUserCredentialByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT * FROM tb_user WHERE user_id = ${connection.escape(data.user_id)} `

  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return reject(new Error('Invalid credential'))

    resolve(res[0])
  })
})

Task.checkLogin = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = ''

  if ('user_id' in data) {
    condition += `AND user_id = ${connection.escape(data.user_id)} `
  } else {
    condition += `AND user_username = ${connection.escape(data.user_username)} 
      AND user_password = ${connection.escape(data.user_password)} `
  }

  let sql = `SELECT user_id,
    license_id,
    user_firstname,
    user_lastname,
    user_img,
    user_username
    FROM tb_user
    WHERE user_status = 'active'
    ${condition}`

  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return reject(new Error('Invalid Username or Password'))

    resolve(res[0])
  })
})

Task.insertUser = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_user (
    user_id,
    license_id,
    user_prefix,
    user_firstname,
    user_lastname,
    user_img,
    user_tel,
    user_email,
    user_username,
    user_password,
    user_address,
    user_status,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.user_id)},
    ${connection.escape(data.license_id)},
    ${connection.escape(data.user_prefix)},
    ${connection.escape(data.user_firstname)},
    ${connection.escape(data.user_lastname)},
    ${connection.escape(data.user_img)},
    ${connection.escape(data.user_tel)},
    ${connection.escape(data.user_email)},
    ${connection.escape(data.user_username)},
    ${connection.escape(data.user_password)},
    ${connection.escape(data.user_address)},
    ${connection.escape(data.user_status)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateUserBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_user SET 
    license_id = ${connection.escape(data.license_id)},
    user_prefix = ${connection.escape(data.user_prefix)},
    user_firstname = ${connection.escape(data.user_firstname)},
    user_lastname = ${connection.escape(data.user_lastname)},
    user_img = ${connection.escape(data.user_img)},
    user_tel = ${connection.escape(data.user_tel)},
    user_email = ${connection.escape(data.user_email)},
    user_username = ${connection.escape(data.user_username)},
    user_address = ${connection.escape(data.user_address)},
    user_status = ${connection.escape(data.user_status)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE user_id = ${connection.escape(data.user_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updatePasswordUserBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_user SET 
    user_password = ${connection.escape(data.user_password)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE user_id = ${connection.escape(data.user_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteUserBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `DELETE FROM tb_user WHERE user_id = ${connection.escape(data.user_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task