const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, grantAccessBranch, mapToCondition } = require("@/utils/db-helper")

Task.generateProductID = (connection) => new Promise((resolve, reject) => {
  let code = `P${formatDate(new Date(), 'yyyyMMdd')}`
  let digit = 4

  let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(product_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
    FROM tb_product
    WHERE product_id LIKE (${connection.escape(`${code}%`)}) 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getProductBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)
  let sub_condition = grantAccessBranch(connection, 'tb.')

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*,
    IFNULL((
      SELECT product_category_name
      FROM tb_product_category
      WHERE tb_product_category.product_category_id = tb.product_category_id
    ), tb.product_category_id) AS product_category_name,
    IFNULL((
      SELECT product_type_name
      FROM tb_product_type
      WHERE tb_product_type.product_type_id = tb.product_type_id
    ), tb.product_type_id) AS product_type_name,
    IFNULL((
      SELECT branch_name
      FROM tb_branch
      WHERE tb_branch.branch_id = tb.branch_id
    ), '') AS branch_name
    FROM tb_product AS tb
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

Task.getProductByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.*,
    branch_name,
    IFNULL((
      SELECT company_name
      FROM tb_company
      WHERE tb_company.company_id = tb_branch.company_id
    ), tb_branch.company_id) AS company_name,
    IFNULL((
      SELECT product_category_name
      FROM tb_product_category
      WHERE tb_product_category.product_category_id = tb.product_category_id
    ), tb.product_category_id) AS product_category_name,
    IFNULL((
      SELECT product_type_name
      FROM tb_product_type
      WHERE tb_product_type.product_type_id = tb.product_type_id
    ), tb.product_type_id) AS product_type_name
    FROM tb_product AS tb
    LEFT JOIN tb_branch ON tb.branch_id = tb_branch.branch_id
    WHERE product_id = ${connection.escape(data.product_id)}
    ${grantAccessBranch(connection, 'tb.')}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})

Task.insertProduct = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_product (
    product_id,
    branch_id,
    product_category_id,
    product_main_id,
    product_type_id,
    product_name,
    product_description,
    product_unit_name1,
    product_unit_name2,
    product_unit_name3,
    product_unit_name4,
    product_unit_name5,
    product_unit_qty1,
    product_unit_qty2,
    product_unit_qty3,
    product_unit_qty4,
    product_unit_qty5,
    product_unit_conv1,
    product_unit_conv2,
    product_unit_conv3,
    product_unit_conv4,
    product_unit_conv5,
    product_status,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.product_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.product_category_id)},
    ${connection.escape(data.product_main_id)},
    ${connection.escape(data.product_type_id)},
    ${connection.escape(data.product_name)},
    ${connection.escape(data.product_description)},
    ${connection.escape(data.product_unit_name1)},
    ${connection.escape(data.product_unit_name2)},
    ${connection.escape(data.product_unit_name3)},
    ${connection.escape(data.product_unit_name4)},
    ${connection.escape(data.product_unit_name5)},
    ${connection.escape(data.product_unit_qty1)},
    ${connection.escape(data.product_unit_qty2)},
    ${connection.escape(data.product_unit_qty3)},
    ${connection.escape(data.product_unit_qty4)},
    ${connection.escape(data.product_unit_qty5)},
    ${connection.escape(data.product_unit_conv1)},
    ${connection.escape(data.product_unit_conv2)},
    ${connection.escape(data.product_unit_conv3)},
    ${connection.escape(data.product_unit_conv4)},
    ${connection.escape(data.product_unit_conv5)},
    ${connection.escape(data.product_status)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.insertSyncProduct = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `INSERT INTO tb_product (
    product_id,
    product_origin_id,
    branch_id,
    product_name,
    product_unit_name1,
    product_unit_name2,
    product_unit_name3,
    product_unit_name4,
    product_unit_name5,
    product_unit_qty1,
    product_unit_qty2,
    product_unit_qty3,
    product_unit_qty4,
    product_unit_qty5,
    product_unit_conv1,
    product_unit_conv2,
    product_unit_conv3,
    product_unit_conv4,
    product_unit_conv5,
    adddate
  ) VALUES (
    ${connection.escape(data.product_id)},
    ${connection.escape(data.product_origin_id)},
    ${connection.escape(data.branch_id)},
    ${connection.escape(data.product_name)},
    ${connection.escape(data.product_unit_name1)},
    ${connection.escape(data.product_unit_name2)},
    ${connection.escape(data.product_unit_name3)},
    ${connection.escape(data.product_unit_name4)},
    ${connection.escape(data.product_unit_name5)},
    ${connection.escape(data.product_unit_qty1)},
    ${connection.escape(data.product_unit_qty2)},
    ${connection.escape(data.product_unit_qty3)},
    ${connection.escape(data.product_unit_qty4)},
    ${connection.escape(data.product_unit_qty5)},
    ${connection.escape(data.product_unit_conv1)},
    ${connection.escape(data.product_unit_conv2)},
    ${connection.escape(data.product_unit_conv3)},
    ${connection.escape(data.product_unit_conv4)},
    ${connection.escape(data.product_unit_conv5)},
    NOW()
  )`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateProductBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_product SET 
    branch_id = ${connection.escape(data.branch_id)},
    product_category_id = ${connection.escape(data.product_category_id)},
    product_main_id = ${connection.escape(data.product_main_id)},
    product_type_id = ${connection.escape(data.product_type_id)},
    product_name = ${connection.escape(data.product_name)},
    product_description = ${connection.escape(data.product_description)},
    product_unit_name1 = ${connection.escape(data.product_unit_name1)},
    product_unit_name2 = ${connection.escape(data.product_unit_name2)},
    product_unit_name3 = ${connection.escape(data.product_unit_name3)},
    product_unit_name4 = ${connection.escape(data.product_unit_name4)},
    product_unit_name5 = ${connection.escape(data.product_unit_name5)},
    product_unit_qty1 = ${connection.escape(data.product_unit_qty1)},
    product_unit_qty2 = ${connection.escape(data.product_unit_qty2)},
    product_unit_qty3 = ${connection.escape(data.product_unit_qty3)},
    product_unit_qty4 = ${connection.escape(data.product_unit_qty4)},
    product_unit_qty5 = ${connection.escape(data.product_unit_qty5)},
    product_unit_conv1 = ${connection.escape(data.product_unit_conv1)},
    product_unit_conv2 = ${connection.escape(data.product_unit_conv2)},
    product_unit_conv3 = ${connection.escape(data.product_unit_conv3)},
    product_unit_conv4 = ${connection.escape(data.product_unit_conv4)},
    product_unit_conv5 = ${connection.escape(data.product_unit_conv5)},
    product_status = ${connection.escape(data.product_status)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE product_id = ${connection.escape(data.product_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateSyncProductBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_product SET 
    product_name = ${connection.escape(data.product_name)},
    product_unit_name1 = ${connection.escape(data.product_unit_name1)},
    product_unit_name2 = ${connection.escape(data.product_unit_name2)},
    product_unit_name3 = ${connection.escape(data.product_unit_name3)},
    product_unit_name4 = ${connection.escape(data.product_unit_name4)},
    product_unit_name5 = ${connection.escape(data.product_unit_name5)},
    product_unit_qty1 = ${connection.escape(data.product_unit_qty1)},
    product_unit_qty2 = ${connection.escape(data.product_unit_qty2)},
    product_unit_qty3 = ${connection.escape(data.product_unit_qty3)},
    product_unit_qty4 = ${connection.escape(data.product_unit_qty4)},
    product_unit_qty5 = ${connection.escape(data.product_unit_qty5)},
    product_unit_conv1 = ${connection.escape(data.product_unit_conv1)},
    product_unit_conv2 = ${connection.escape(data.product_unit_conv2)},
    product_unit_conv3 = ${connection.escape(data.product_unit_conv3)},
    product_unit_conv4 = ${connection.escape(data.product_unit_conv4)},
    product_unit_conv5 = ${connection.escape(data.product_unit_conv5)}
    WHERE product_id = ${connection.escape(data.product_id)}
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

  let sql = `UPDATE tb_product SET ${fields.join(',')} WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteProductBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_product WHERE TRUE 
    ${grantAccessBranch(connection)}
    ${condition} 
    `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;