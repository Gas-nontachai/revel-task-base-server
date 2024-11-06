const { useConnection } = require('@/utils/db-helper')

const {
  InvoiceSupplierListModel,
  InvoiceSupplierModel,
  PaymentModel,
} = require('@/models')

const { Mailer } = require('@/plugins')

const maintenanceData = async (connection) => {
  const { docs: invoice_suppliers } = await InvoiceSupplierModel.getDuplicateBy(connection)

  console.log('Duplicate', invoice_suppliers.length)

  await InvoiceSupplierModel.deleteInvoiceSupplierBy(connection, {
    match: {
      invoice_supplier_id: { $in: invoice_suppliers.map(item => item.invoice_supplier_id) },
    }
  })
}

const testMail = async (connection) => {
  const { docs: invoice_suppliers } = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
    pagination: { page: 1, size: 1, },
    sorter: { key: 'invoice_supplier_id', order: "DESC" },
  })
  const { docs: invoice_supplier_lists } = await InvoiceSupplierListModel.getInvoiceSupplierListBy(connection, {
    match: { invoice_supplier_id: invoice_suppliers[0].invoice_supplier_id }
  })

  await Mailer.createMail(connection, `sync-data:add-invoice`, [{
    invoice_supplier: invoice_suppliers[0],
    invoice_supplier_lists,
  }])
}

(async function run() {
  await useConnection(async connection => {
    console.log("========= Begin maintenance =========");

    await testMail(connection)

    console.log("========= End maintenance =========");
  })
})()