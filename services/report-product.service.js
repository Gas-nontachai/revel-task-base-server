const Task = function (task) { this.task = task.task }

const {
  InvoiceSupplierListModel,
  ProductModel,
  SupplierModel,
} = require("@/models")

Task.getReportProductInvoiceBy = async (connection, data) => {
  const { match, search, } = data

  const { docs: invoice_supplier_lists } = await InvoiceSupplierListModel.getFullInvoiceSupplierListBy(connection, {
    search,
    match,
    sorter: { key: 'product_id', order: "ASC" },
  })

  const { docs: products } = await ProductModel.getProductBy(connection, {
    match: {
      $or: [
        { product_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.product_id))) }, },
        { product_main_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.product_id))) }, },
      ]
    }
  })

  const { docs: suppliers } = await SupplierModel.getSupplierBy(connection, {
    match: {
      supplier_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.supplier_id))) },
    }
  })

  invoice_supplier_lists.forEach(invoice_supplier_list => {
    invoice_supplier_list.supplier = suppliers.find(val => val.supplier_id === invoice_supplier_list.supplier_id)
  })

  const main_products = products.filter(val => !val.product_main_id)
  const sub_products = products.filter(val => val.product_main_id)

  const report_product_invoices = []
  main_products.forEach(product => {
    const same_products = sub_products.filter(val => val.product_main_id === product.product_id)
    const same_product_ids = same_products.map(item => item.product_id)

    report_product_invoices.push({
      product,
      product_origin_ids: Array.from(new Set([product.product_origin_id, ...same_products.map(item => item.product_origin_id)])).filter(val => val),
      invoice_supplier_products: invoice_supplier_lists.filter(val => val.product_id === product.product_id || same_product_ids.includes(val.product_id)),
    })
  })

  return report_product_invoices
}

module.exports = Task