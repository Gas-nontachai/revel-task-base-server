const Task = function (task) { this.task = task.task }

const {
  InvoiceSupplierListModel,
  ProductModel,
  SupplierModel,
} = require("@/models")

Task.getReportSupplierInvoiceBy = async (connection, data) => {
  const { match, search, } = data

  const { docs: invoice_supplier_lists } = await InvoiceSupplierListModel.getFullInvoiceSupplierListBy(connection, {
    search,
    match,
    sorter: { key: 'product_id', order: "ASC" },
  })

  const { docs: products } = await ProductModel.getProductBy(connection, {
    match: {
      product_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.product_id))) },
    }
  })

  const { docs: suppliers } = await SupplierModel.getSupplierBy(connection, {
    match: {
      $or: [
        { supplier_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.supplier_id))) }, },
        { supplier_main_id: { $in: Array.from(new Set(invoice_supplier_lists.map(item => item.supplier_id))) }, },
      ]
    }
  })

  invoice_supplier_lists.forEach(invoice_supplier_list => {
    invoice_supplier_list.product = products.find(val => val.product_id === invoice_supplier_list.product_id)
  })

  const main_suppliers = suppliers.filter(val => !val.supplier_main_id)
  const sub_suppliers = suppliers.filter(val => val.supplier_main_id)

  const report_supplier_invoices = []
  main_suppliers.forEach(supplier => {
    const same_suppliers = sub_suppliers.filter(val => val.supplier_main_id === supplier.supplier_id)
    const same_supplier_ids = same_suppliers.map(item => item.supplier_id)

    report_supplier_invoices.push({
      supplier,
      supplier_origin_ids: Array.from(new Set([supplier.supplier_origin_id, ...same_suppliers.map(item => item.supplier_origin_id)])).filter(val => val),
      invoice_supplier_products: invoice_supplier_lists.filter(val => val.supplier_id === supplier.supplier_id || same_supplier_ids.includes(val.supplier_id)),
    })
  })

  return report_supplier_invoices
}

module.exports = Task