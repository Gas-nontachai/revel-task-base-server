const Task = function (task) {
  this.task = task.task
  this.status = task.status
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, grantAccessBranch, mapCompare, mapToCondition, } = require("@/utils/db-helper")

Task.generateInvoiceSupplierID = (connection) => new Promise((resolve, reject) => {
  let code = `B${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 6

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(invoice_supplier_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_invoice_supplier
    WHERE invoice_supplier_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getInvoiceSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection)

  data.match?.$sub?.forEach(item => {
    const { book_bank_id } = item

    if (book_bank_id) {
      sub_condition += `AND invoice_supplier_id IN (
        SELECT invoice_supplier_id
        FROM tb_payment
        WHERE ${mapCompare('book_bank_id', book_bank_id).condition}
      ) `
    }
  });

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_invoice_supplier AS tb
    WHERE TRUE
    ${condition}
    ${sub_condition}
    ${filter}
  `
  const count_query = `SELECT COUNT(*) AS total FROM (${core_query}) AS tb`
  if (data.count) return connection.query(count_query, function (err, res) {
    err ? reject(new Error(err.message)) : resolve(res[0].total)
  })

  connection.query(`${core_query} ${sort} ${pagination}`, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!pagination) return resolve({ docs: res, totalDocs: res.length })

    connection.query(count_query, function (err, res_total) {
      err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res_total[0].total })
    })
  })
})

Task.getInvoiceSupplierByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    IFNULL((
      SELECT CONCAT(user_prefix, ' ', user_firstname, ' ', user_lastname)
      FROM tb_user
      WHERE tb_user.user_id = tb.user_id
    ), tb.user_id) AS user_fullname
    FROM tb_invoice_supplier AS tb
    WHERE invoice_supplier_id = ${connection.escape(data.invoice_supplier_id)}
    ${grantAccessBranch(connection)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.getSumInvoiceSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection)

  data.match?.$sub?.forEach(item => {
    const { book_bank_id } = item

    if (book_bank_id) {
      sub_condition += `AND invoice_supplier_id IN (
        SELECT invoice_supplier_id
        FROM tb_payment
        WHERE ${mapCompare('book_bank_id', book_bank_id).condition}
      ) `
    }
  });

  const { filter, } = generateQuery(data)

  const core_query = `SELECT IFNULL(SUM(invoice_supplier_weight), 0) AS weight,
    IFNULL(SUM(invoice_supplier_price), 0) AS price,
    IFNULL(SUM(invoice_supplier_vat_price), 0) AS vat_price,
    IFNULL(SUM(invoice_supplier_net_price), 0) AS net_price
    FROM tb_invoice_supplier AS tb
    WHERE TRUE
    ${condition}
    ${sub_condition}
    ${filter}
  `
  connection.query(core_query, function (err, res) {
    err ? reject(new Error(err.message)) : resolve(res[0])
  })
})

Task.getDuplicateBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const core_query = `
    SELECT MAX(invoice_supplier_id) AS invoice_supplier_id,
    invoice_supplier_origin_id
    FROM tb_invoice_supplier
    WHERE TRUE
    ${condition}
    GROUP BY invoice_supplier_origin_id, branch_id
    HAVING COUNT(*) > 1
    ORDER BY invoice_supplier_id
  `
  connection.query(core_query, function (err, res) {
    if (err) return reject(new Error(err.message))

    resolve({ docs: res, totalDocs: res.length })
  })
})

Task.insertInvoiceSupplier = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_invoice_supplier (
    invoice_supplier_id,
    invoice_supplier_origin_id,
    branch_id,
    company_id,
    supplier_id,
    user_id,
    invoice_supplier_name,
    invoice_supplier_account,
    invoice_supplier_branch_name,
    invoice_supplier_company_name,
    invoice_supplier_license_plate,
    invoice_supplier_date,
    invoice_supplier_contact,
    invoice_supplier_weight,
    invoice_supplier_price,
    invoice_supplier_vat_type,
    invoice_supplier_vat_rate,
    invoice_supplier_vat_price,
    invoice_supplier_net_price,
    invoice_supplier_paid_type,
    invoice_supplier_remark,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.invoice_supplier_id)},
    ${connection.escape(data.invoice_supplier_origin_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.supplier_id)},
    ${connection.escape(data.user_id)},
    ${connection.escape(data.invoice_supplier_name)},
    ${connection.escape(data.invoice_supplier_account)},
    ${connection.escape(data.invoice_supplier_branch_name)},
    ${connection.escape(data.invoice_supplier_company_name)},
    ${connection.escape(data.invoice_supplier_license_plate)},
    ${connection.escape(formatDate(data.invoice_supplier_date, 'yyyy-MM-dd'))},
    ${connection.escape(data.invoice_supplier_contact)},
    ${connection.escape(data.invoice_supplier_weight.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_price.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_vat_type)},
    ${connection.escape(data.invoice_supplier_vat_rate.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_vat_price.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_net_price.toString().replace(',', ''))},
    'เงินโอน',
    ${connection.escape(data.invoice_supplier_remark)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.insertSyncInvoiceSupplier = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_invoice_supplier (
    invoice_supplier_id,
    invoice_supplier_origin_id,
    branch_id,
    company_id,
    supplier_id,
    invoice_supplier_name,
    invoice_supplier_account,
    invoice_supplier_branch_name,
    invoice_supplier_company_name,
    invoice_supplier_license_plate,
    invoice_supplier_date,
    invoice_supplier_weight,
    invoice_supplier_price,
    invoice_supplier_vat_type,
    invoice_supplier_vat_rate,
    invoice_supplier_vat_price,
    invoice_supplier_net_price,
    invoice_supplier_key_by,
    invoice_supplier_key_date,
    invoice_supplier_paid_type,
    invoice_supplier_remark,
    invoice_supplier_status,
    is_sync,
    adddate
  ) VALUES (
    ${connection.escape(data.invoice_supplier_id)},
    ${connection.escape(data.invoice_supplier_origin_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.supplier_id)},
    ${connection.escape(data.invoice_supplier_name)},
    ${connection.escape(data.invoice_supplier_account)},
    ${connection.escape(data.invoice_supplier_branch_name)},
    ${connection.escape(data.invoice_supplier_company_name)},
    ${connection.escape(data.invoice_supplier_license_plate)},
    ${connection.escape(data.invoice_supplier_date)},
    ${connection.escape(data.invoice_supplier_weight.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_price.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_vat_type)},
    ${connection.escape(data.invoice_supplier_vat_rate.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_vat_price.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_net_price.toString().replace(',', ''))},
    ${connection.escape(data.invoice_supplier_key_by)},
    ${connection.escape(data.invoice_supplier_key_date)},
    ${connection.escape(data.invoice_supplier_paid_type)},
    ${connection.escape(data.invoice_supplier_remark)},
    ${connection.escape(data.invoice_supplier_status)},
    1,
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateOriginInvoiceSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_invoice_supplier SET 
    invoice_supplier_origin_id = ${connection.escape(data.invoice_supplier_origin_id)}
    WHERE invoice_supplier_id = ${connection.escape(data.invoice_supplier_id)}
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateInvoiceSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_invoice_supplier SET 
    invoice_supplier_origin_id = ${connection.escape(data.invoice_supplier_origin_id)},
    branch_id = ${connection.escape(data.branch_id)},
    company_id = ${connection.escape(data.company_id)},
    supplier_id = ${connection.escape(data.supplier_id)},
    user_id = ${connection.escape(data.user_id)},
    invoice_supplier_name = ${connection.escape(data.invoice_supplier_name)},
    invoice_supplier_account = ${connection.escape(data.invoice_supplier_account)},
    invoice_supplier_branch_name = ${connection.escape(data.invoice_supplier_branch_name)},
    invoice_supplier_company_name = ${connection.escape(data.invoice_supplier_company_name)},
    invoice_supplier_license_plate = ${connection.escape(data.invoice_supplier_license_plate)},
    invoice_supplier_date = ${connection.escape(formatDate(data.invoice_supplier_date, 'yyyy-MM-dd'))},
    invoice_supplier_contact = ${connection.escape(data.invoice_supplier_contact)},
    invoice_supplier_weight = ${connection.escape(data.invoice_supplier_weight.toString().replace(',', ''))},
    invoice_supplier_price = ${connection.escape(data.invoice_supplier_price.toString().replace(',', ''))},
    invoice_supplier_vat_type = ${connection.escape(data.invoice_supplier_vat_type)},
    invoice_supplier_vat_rate = ${connection.escape(data.invoice_supplier_vat_rate.toString().replace(',', ''))},
    invoice_supplier_vat_price = ${connection.escape(data.invoice_supplier_vat_price.toString().replace(',', ''))},
    invoice_supplier_net_price = ${connection.escape(data.invoice_supplier_net_price.toString().replace(',', ''))},
    invoice_supplier_remark = ${connection.escape(data.invoice_supplier_remark)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE invoice_supplier_id = ${connection.escape(data.invoice_supplier_id)}
    ${grantAccessBranch(connection)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.setUpdateBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const fields = []
  for (const key in data.set) {
    fields.push(`${key} = ${connection.escape(data.set[key])}`)
  }

  if (!fields.length) reject(new Error('data set not required'))

  let sql = `UPDATE tb_invoice_supplier SET ${fields.join(',')} WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteInvoiceSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_invoice_supplier WHERE TRUE 
    ${grantAccessBranch(connection)}
    ${condition} 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;