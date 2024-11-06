const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, grantAccessBranch, mapToCondition } = require("@/utils/db-helper")

Task.generateSupplierID = (connection) => new Promise((resolve, reject) => {
  let code = `S${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(supplier_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_supplier
    WHERE supplier_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection, 'tb.')

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT company_name
      FROM tb_company
      WHERE tb_company.company_id = tb.company_id
    ), '') AS company_name,
    IFNULL((
      SELECT branch_name
      FROM tb_branch
      WHERE tb_branch.branch_id = tb.branch_id
    ), '') AS branch_name
    FROM tb_supplier AS tb
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

Task.getSupplierByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    IFNULL((
      SELECT company_name
      FROM tb_company
      WHERE tb_company.company_id = tb.company_id
    ), '') AS company_name,
    IFNULL((
      SELECT branch_name
      FROM tb_branch
      WHERE tb_branch.branch_id = tb.branch_id
    ), '') AS branch_name
    FROM tb_supplier AS tb
    WHERE supplier_id = ${connection.escape(data.supplier_id)}
    ${grantAccessBranch(connection, 'tb.')}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertSyncSupplier = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_supplier (
    supplier_id,
    branch_id,
    company_id,
    supplier_origin_id,
    supplier_name,
    supplier_contact_name,
    supplier_contact1,
    supplier_contact2,
    supplier_contact3,
    supplier_address,
    supplier_vat_rate,
    supplier_remark,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.supplier_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.supplier_origin_id)},
    ${connection.escape(data.supplier_name)},
    ${connection.escape(data.supplier_contact_name)},
    ${connection.escape(data.supplier_contact1)},
    ${connection.escape(data.supplier_contact2)},
    ${connection.escape(data.supplier_contact3)},
    ${connection.escape(data.supplier_address)},
    ${connection.escape(data.supplier_vat_rate)},
    ${connection.escape(data.supplier_remark)},
    '',
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.insertSupplier = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_supplier (
    supplier_id,
    branch_id,
    company_id,
    supplier_main_id,
    supplier_origin_id,
    supplier_name,
    supplier_contact_name,
    supplier_tax,
    supplier_contact1,
    supplier_contact2,
    supplier_contact3,
    supplier_address,
    supplier_vat_rate,
    supplier_remark,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.supplier_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.company_id)},
    ${connection.escape(data.supplier_main_id)},
    ${connection.escape(data.supplier_origin_id)},
    ${connection.escape(data.supplier_name)},
    ${connection.escape(data.supplier_contact_name)},
    ${connection.escape(data.supplier_tax)},
    ${connection.escape(data.supplier_contact1)},
    ${connection.escape(data.supplier_contact2)},
    ${connection.escape(data.supplier_contact3)},
    ${connection.escape(data.supplier_address)},
    ${connection.escape(data.supplier_vat_rate)},
    ${connection.escape(data.supplier_remark)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateSyncSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_supplier SET 
    supplier_name = ${connection.escape(data.supplier_name)},
    supplier_contact_name = ${connection.escape(data.supplier_contact_name)},
    supplier_contact1 = ${connection.escape(data.supplier_contact1)},
    supplier_contact2 = ${connection.escape(data.supplier_contact2)},
    supplier_contact3 = ${connection.escape(data.supplier_contact3)},
    supplier_address = ${connection.escape(data.supplier_address)},
    supplier_vat_rate = ${connection.escape(data.supplier_vat_rate)},
    supplier_remark = ${connection.escape(data.supplier_remark)},
    lastupdate = NOW()
    WHERE supplier_id = ${connection.escape(data.supplier_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_supplier SET 
    branch_id = ${connection.escape(data.branch_id)},
    company_id = ${connection.escape(data.company_id)},
    supplier_main_id = ${connection.escape(data.supplier_main_id)},
    supplier_origin_id = ${connection.escape(data.supplier_origin_id)},
    supplier_name = ${connection.escape(data.supplier_name)},
    supplier_contact_name = ${connection.escape(data.supplier_contact_name)},
    supplier_tax = ${connection.escape(data.supplier_tax)},
    supplier_contact1 = ${connection.escape(data.supplier_contact1)},
    supplier_contact2 = ${connection.escape(data.supplier_contact2)},
    supplier_contact3 = ${connection.escape(data.supplier_contact3)},
    supplier_address = ${connection.escape(data.supplier_address)},
    supplier_vat_rate = ${connection.escape(data.supplier_vat_rate)},
    supplier_remark = ${connection.escape(data.supplier_remark)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE supplier_id = ${connection.escape(data.supplier_id)}
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

  let sql = `UPDATE tb_supplier SET ${fields.join(',')} WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteSupplierBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_supplier WHERE TRUE 
    ${grantAccessBranch(connection)}
    ${condition}
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;