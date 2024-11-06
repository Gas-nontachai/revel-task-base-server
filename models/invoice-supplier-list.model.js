const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const {
  generateID,
  generateQuery,
  mapCompare,
  mapToCondition,
} = require("@/utils/db-helper")

Task.getInvoiceSupplierListBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*
    FROM tb_invoice_supplier_list AS tb
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

Task.getFullInvoiceSupplierListBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  let sub_condition = ''
  data.match?.$sub?.forEach(item => {
    const { product_id, supplier_id } = item

    if (product_id) {
      sub_condition += `AND tb.product_id IN (
        SELECT product_id
        FROM tb_product
        WHERE ${mapCompare('product_id', product_id).condition} 
        OR ${mapCompare('product_main_id', product_id).condition}
      ) `
    }

    if (supplier_id) {
      sub_condition += `AND supplier_id IN (
        SELECT supplier_id
        FROM tb_supplier
        WHERE ${mapCompare('supplier_id', supplier_id).condition} 
        OR ${mapCompare('supplier_main_id', supplier_id).condition}
      ) `
    }
  });

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT tb.*, 
    tb_invoice_supplier.*
    FROM tb_invoice_supplier_list AS tb
    LEFT JOIN tb_invoice_supplier ON tb.invoice_supplier_id = tb_invoice_supplier.invoice_supplier_id
    LEFT JOIN tb_product ON tb.product_id = tb_product.product_id
    WHERE invoice_supplier_status != 'cancel'
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

Task.insertInvoiceSupplierList = async (connection, data = {}) => {
  const max_item = 500

  const { invoice_supplier_id, invoice_supplier_lists, } = data

  if (!invoice_supplier_lists.length) return

  for (let i = 0; i < Math.ceil((invoice_supplier_lists.length / max_item)); i++) {
    await new Promise((resolve, reject) => {
      const curr_items = invoice_supplier_lists.slice(i * max_item, (i + 1) * max_item)

      const item_txts = curr_items.map((item, idx) => {
        const id = `RPL${generateID()}`

        return `${connection.escape(id)},
          ${connection.escape(invoice_supplier_id)},
          ${connection.escape(item.product_id)},
          ${connection.escape(item.invoice_supplier_list_name)},
          ${connection.escape(item.invoice_supplier_list_net_weight.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_net_weight.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_unit_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_price?.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_remark)}
        `
      })

      const sql = `INSERT INTO tb_invoice_supplier_list (
        invoice_supplier_list_id,
        invoice_supplier_id,
        product_id,
        invoice_supplier_list_name,
        invoice_supplier_list_weight,
        invoice_supplier_list_net_weight,
        invoice_supplier_list_unit_price,
        invoice_supplier_list_price,
        invoice_supplier_list_remark
      ) VALUES (${item_txts.join('), (')}); `

      connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
    })
  }
}

Task.insertSyncInvoiceSupplierList = async (connection, data = {}) => {
  const max_item = 500

  const { invoice_supplier_id, invoice_supplier_lists, } = data

  if (!invoice_supplier_lists.length) return

  for (let i = 0; i < Math.ceil((invoice_supplier_lists.length / max_item)); i++) {
    await new Promise((resolve, reject) => {
      const curr_items = invoice_supplier_lists.slice(i * max_item, (i + 1) * max_item)

      const item_txts = curr_items.map((item, idx) => {
        const id = `RPL${generateID()}`

        return `${connection.escape(id)},
          ${connection.escape(invoice_supplier_id)},
          ${connection.escape(item.product_id)},
          ${connection.escape(item.invoice_supplier_list_name)},
          ${connection.escape(item.invoice_supplier_list_unit_name)},
          ${connection.escape(item.invoice_supplier_list_qty.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_convert_weight.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_weight.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_deweight_quality.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_deweight_percent.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_deweight_compensation.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_net_weight.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_unit_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_unit_promotion_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_unit_shipping_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_unit_other_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_price.toString().replace(',', ''))},
          ${connection.escape(item.invoice_supplier_list_remark)}
        `
      })

      const sql = `INSERT INTO tb_invoice_supplier_list (
        invoice_supplier_list_id,
        invoice_supplier_id,
        product_id,
        invoice_supplier_list_name,
        invoice_supplier_list_unit_name,
        invoice_supplier_list_qty,
        invoice_supplier_list_convert_weight,
        invoice_supplier_list_weight,
        invoice_supplier_list_deweight_quality,
        invoice_supplier_list_deweight_percent,
        invoice_supplier_list_deweight_compensation,
        invoice_supplier_list_net_weight,
        invoice_supplier_list_unit_price,
        invoice_supplier_list_unit_promotion_price,
        invoice_supplier_list_unit_shipping_price,
        invoice_supplier_list_unit_other_price,
        invoice_supplier_list_price,
        invoice_supplier_list_remark
      ) VALUES (${item_txts.join('), (')}); `

      connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
    })
  }
}

Task.updateInvoiceSupplierListBy = async (connection, data = {}) => {
  const max_item = 500

  const { invoice_supplier_lists, } = data

  if (!invoice_supplier_lists.length) return

  for (let i = 0; i < Math.ceil((invoice_supplier_lists.length / max_item)); i++) {
    await new Promise((resolve, reject) => {
      const curr_items = invoice_supplier_lists.slice(i * max_item, (i + 1) * max_item)

      const sql = curr_items.map(item => `UPDATE tb_invoice_supplier_list SET 
        product_id = ${connection.escape(item.product_id)},
        invoice_supplier_list_name = ${connection.escape(item.invoice_supplier_list_name)},
        invoice_supplier_list_weight = ${connection.escape(item.invoice_supplier_list_weight.toString().replace(',', ''))},
        invoice_supplier_list_net_weight = ${connection.escape(item.invoice_supplier_list_net_weight.toString().replace(',', ''))},
        invoice_supplier_list_unit_price = ${connection.escape(item.invoice_supplier_list_unit_price.toString().replace(',', ''))},
        invoice_supplier_list_price = ${connection.escape(item.invoice_supplier_list_price.toString().replace(',', ''))},
        invoice_supplier_list_remark = ${connection.escape(item.invoice_supplier_list_remark)}
        WHERE invoice_supplier_list_id = ${connection.escape(item.invoice_supplier_list_id)}
      `).join('; ')

      connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
    })
  }
}

Task.updateMergeInvoiceSupplierListBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_invoice_supplier_list SET 
    invoice_supplier_id = ${connection.escape(data.invoice_supplier_new_id)}
    WHERE invoice_supplier_id = ${connection.escape(data.invoice_supplier_old_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteInvoiceSupplierListBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_invoice_supplier_list WHERE TRUE ${condition}`
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task