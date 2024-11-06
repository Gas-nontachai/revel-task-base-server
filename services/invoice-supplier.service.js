const Task = function (task) { this.task = task.task }

const {
  InvoiceSupplierModel,
  InvoiceSupplierListModel,
  PaymentModel
} = require("@/models")

const { Mailer, Notify } = require('@/plugins')

const { toFloat } = require("@/utils/number-helper");

Task.generateInvoiceSupplierID = (connection) => InvoiceSupplierModel.generateInvoiceSupplierID(connection)
Task.getInvoiceSupplierBy = async (connection, data) => {
  const { options = [] } = data

  const invoice_suppliers = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, data)

  if (options.length) {
    if (options.includes('payments')) {
      const payments = await PaymentModel.getPaymentBy(connection, {
        invoice_supplier_id: { $in: invoice_suppliers.docs.map(item => item.invoice_supplier_id) },
      }).then(res => res.docs)

      invoice_suppliers.docs.forEach(item => {
        item.payments = payments.filter(val => val.invoice_supplier_id === item.invoice_supplier_id)
      });
    }
  }

  return invoice_suppliers
}
Task.getInvoiceSupplierByID = (connection, data) => InvoiceSupplierModel.getInvoiceSupplierByID(connection, data)
Task.getSumInvoiceSupplierBy = (connection, data) => InvoiceSupplierModel.getSumInvoiceSupplierBy(connection, data)

Task.mergeInvoiceSupplier = async (connection, data) => {
  const invoice_supplier_merges = data.invoice_suppliers.filter(val => val.invoice_supplier_origin_id)

  const { docs: invoice_supplier_synceds } = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
    match: {
      invoice_supplier_origin_id: { $in: invoice_supplier_merges.map(item => item.invoice_supplier_origin_id) },
    }
  })

  for (const invoice_supplier_merge of invoice_supplier_merges) {
    const {
      invoice_supplier_origin_id,
    } = invoice_supplier_merge

    const invoice_supplier_synced = invoice_supplier_synceds.find(val => val.invoice_supplier_origin_id === invoice_supplier_origin_id)

    if (!invoice_supplier_synced) {
      await InvoiceSupplierModel.updateOriginInvoiceSupplierBy(connection, {
        invoice_supplier_id: invoice_supplier_merge.invoice_supplier_id,
        invoice_supplier_origin_id,
      })

      continue
    }

    const {
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
      invoice_supplier_key_by,
      invoice_supplier_key_date,
      invoice_supplier_paid_date,
      invoice_supplier_paid_type,
      invoice_supplier_remark,
    } = invoice_supplier_synced

    await InvoiceSupplierListModel.deleteInvoiceSupplierListBy(connection, { match: { invoice_supplier_id: invoice_supplier_merge.invoice_supplier_id } })
    await PaymentModel.deletePaymentBy(connection, { match: { invoice_supplier_id: invoice_supplier_merge.invoice_supplier_id } })

    await PaymentModel.updateMergePaymentBy(connection, {
      invoice_supplier_old_id: invoice_supplier_synced.invoice_supplier_id,
      invoice_supplier_new_id: invoice_supplier_merge.invoice_supplier_id,
    })
    await InvoiceSupplierListModel.updateMergeInvoiceSupplierListBy(connection, {
      invoice_supplier_old_id: invoice_supplier_synced.invoice_supplier_id,
      invoice_supplier_new_id: invoice_supplier_merge.invoice_supplier_id,
    })
    await InvoiceSupplierModel.setUpdateBy(connection, {
      set: {
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
        invoice_supplier_key_by,
        invoice_supplier_key_date,
        invoice_supplier_paid_date,
        invoice_supplier_paid_type,
        invoice_supplier_remark,
      },
      match: { invoice_supplier_id: invoice_supplier_merge.invoice_supplier_id, },
    })
    await InvoiceSupplierModel.deleteInvoiceSupplierBy(connection, {
      match: { invoice_supplier_id: invoice_supplier_synced.invoice_supplier_id, }
    })
  }
}
Task.insertInvoiceSupplier = async (connection, data) => {
  const { invoice_supplier, invoice_supplier_lists } = data

  invoice_supplier.invoice_supplier_id = await InvoiceSupplierModel.generateInvoiceSupplierID(connection)

  await InvoiceSupplierModel.insertInvoiceSupplier(connection, invoice_supplier)
  await InvoiceSupplierListModel.insertInvoiceSupplierList(connection, {
    invoice_supplier_id: invoice_supplier.invoice_supplier_id,
    invoice_supplier_lists,
  })
}
Task.updateInvoiceSupplierBy = async (connection, data) => {
  const { invoice_supplier, invoice_supplier_lists } = data

  await InvoiceSupplierListModel.deleteInvoiceSupplierListBy(connection, {
    match: {
      invoice_supplier_id: invoice_supplier.invoice_supplier_id,
      invoice_supplier_list_id: { $nin: invoice_supplier_lists.map(val => val.invoice_supplier_list_id) },
    }
  })

  await InvoiceSupplierListModel.insertInvoiceSupplierList(connection, {
    invoice_supplier_id: invoice_supplier.invoice_supplier_id,
    invoice_supplier_lists: invoice_supplier_lists.filter(val => !val.invoice_supplier_list_id),
  })
  await InvoiceSupplierListModel.updateInvoiceSupplierListBy(connection, {
    invoice_supplier_lists: invoice_supplier_lists.filter(val => val.invoice_supplier_list_id),
  })

  await InvoiceSupplierModel.updateInvoiceSupplierBy(connection, invoice_supplier)
}
Task.updateInvoiceSupplierPaidBy = async (connection, data) => {
  const { payment } = data

  const invoice_supplier = await InvoiceSupplierModel.getInvoiceSupplierByID(connection, { invoice_supplier_id: payment.invoice_supplier_id })

  const invoice_supplier_status = toFloat(payment.payment_net_price) === toFloat(invoice_supplier.invoice_supplier_net_price) ? 'paid' : 'invalid'

  await InvoiceSupplierModel.setUpdateBy(connection, {
    set: {
      invoice_supplier_paid_date: payment.payment_date,
      invoice_supplier_status,
    },
    match: { invoice_supplier_id: payment.invoice_supplier_id, },
  })

  if (invoice_supplier.invoice_supplier_status === invoice_supplier_status) return

  await Mailer.createMail(connection, `payment:${invoice_supplier_status}`, payment)
  await Notify.send(connection, `payment:${invoice_supplier_status}`, payment)
}
Task.deleteInvoiceSupplierBy = async (connection, data) => {
  const { invoice_supplier_id } = data

  await PaymentModel.deletePaymentBy(connection, { match: { invoice_supplier_id } })
  await InvoiceSupplierListModel.deleteInvoiceSupplierListBy(connection, { match: { invoice_supplier_id } })
  await InvoiceSupplierModel.deleteInvoiceSupplierBy(connection, { match: { invoice_supplier_id } })
}

module.exports = Task