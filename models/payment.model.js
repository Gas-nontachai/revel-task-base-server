const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const {
  generateID,
  generateQuery,
  grantAccessBranch,
  mapToCondition,
} = require("@/utils/db-helper")

Task.getPaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection, 'tb.')

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname)
      FROM tb_user
      WHERE tb_user.user_id = tb.user_id
    ), tb.user_id) AS user_fullname
    FROM tb_payment AS tb
    WHERE TRUE
    ${condition}
    ${sub_condition}
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

Task.getReportPaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection, 'tb.')

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    tb_invoice_supplier.*,
    IFNULL((
      SELECT CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname)
      FROM tb_user
      WHERE tb_user.user_id = tb.user_id
    ), tb.user_id) AS user_fullname
    FROM tb_payment AS tb
    LEFT JOIN tb_invoice_supplier ON tb.invoice_supplier_id = tb_invoice_supplier.invoice_supplier_id AND tb.branch_id = tb_invoice_supplier.branch_id
    WHERE TRUE
    ${condition}
    ${sub_condition}
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

Task.getPaymentByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    IFNULL((
      SELECT CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname)
      FROM tb_user
      WHERE tb_user.user_id = tb.user_id
    ), tb.user_id) AS user_fullname
    FROM tb_payment AS tb
    WHERE payment_id = ${connection.escape(data.payment_id)}
    ${grantAccessBranch(connection)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertPayment = (connection, data = {}) => new Promise((resolve, reject) => {
  const id = `PD${generateID()}`

  let sql = `INSERT INTO tb_payment (
    payment_id,
    branch_id,
    book_bank_id,
    invoice_supplier_id,
    user_id,
    payment_type,
    payment_date,
    payment_price,
    payment_vat_price,
    payment_net_price,
    payment_remark,
    payment_slip_url,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.book_bank_id)},
    ${connection.escape(data.invoice_supplier_id)},
    ${connection.escape(data.user_id)},
    'เงินโอน',
    ${connection.escape(formatDate(data.payment_date, 'yyyy-MM-dd HH:mm:ss'))},
    ${connection.escape(data.payment_price.toString().replace(',', ''))},
    ${connection.escape(data.payment_vat_price.toString().replace(',', ''))},
    ${connection.escape(data.payment_net_price.toString().replace(',', ''))},
    ${connection.escape(data.payment_remark)},
    ${connection.escape(data.payment_slip_url)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve({ ...res, data: id }) })
})

Task.insertSyncPayment = (connection, data = {}) => new Promise((resolve, reject) => {
  const id = `PD${generateID()}`

  let sql = `INSERT INTO tb_payment (
    payment_id,
    branch_id,
    invoice_supplier_id,
    payment_type,
    payment_date,
    payment_price,
    payment_vat_price,
    payment_net_price,
    adddate
  ) VALUES (
    ${connection.escape(id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.invoice_supplier_id)},
    ${connection.escape(data.payment_type)},
    ${connection.escape(formatDate(data.payment_date, 'yyyy-MM-dd HH:mm:ss'))},
    ${connection.escape(data.payment_price.toString().replace(',', ''))},
    ${connection.escape(data.payment_vat_price.toString().replace(',', ''))},
    ${connection.escape(data.payment_net_price.toString().replace(',', ''))},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve({ ...res, data: id }) })
})

Task.updatePaymentBranch = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_payment SET 
    branch_id = ${connection.escape(data.branch_id)}
    WHERE payment_id = ${connection.escape(data.payment_id)}
    ${grantAccessBranch(connection)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updatePaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_payment SET 
    book_bank_id = ${connection.escape(data.book_bank_id)},
    user_id = ${connection.escape(data.user_id)},
    payment_date = ${connection.escape(formatDate(data.payment_date, 'yyyy-MM-dd HH:mm:ss'))},
    payment_price = ${connection.escape(data.payment_price.toString().replace(',', ''))},
    payment_vat_price = ${connection.escape(data.payment_vat_price.toString().replace(',', ''))},
    payment_net_price = ${connection.escape(data.payment_net_price.toString().replace(',', ''))},
    payment_remark = ${connection.escape(data.payment_remark)},
    payment_slip_url = ${connection.escape(data.payment_slip_url)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE payment_id = ${connection.escape(data.payment_id)}
    ${grantAccessBranch(connection)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateSyncPaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_payment SET 
    payment_type = ${connection.escape(data.payment_type)},
    payment_price = ${connection.escape(data.payment_price.toString().replace(',', ''))},
    payment_vat_price = ${connection.escape(data.payment_vat_price.toString().replace(',', ''))},
    payment_net_price = ${connection.escape(data.payment_net_price.toString().replace(',', ''))},
    lastupdate = NOW()
    WHERE payment_id = ${connection.escape(data.payment_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateMergePaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_payment SET 
    invoice_supplier_id = ${connection.escape(data.invoice_supplier_new_id)}
    WHERE invoice_supplier_id = ${connection.escape(data.invoice_supplier_old_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deletePaymentBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_payment WHERE TRUE 
    ${grantAccessBranch(connection)}
    ${condition}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;