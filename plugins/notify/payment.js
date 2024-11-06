const { InvoiceSupplierModel, } = require("@/models")

const { getUserNotifyActive } = require("@/utils/auth-helper")
const { formatDate } = require('@/utils/date-helper')

const paymentPaid = async (connection, data) => {
  const { invoice_supplier_id } = data

  const invoice_supplier = await InvoiceSupplierModel.getInvoiceSupplierByID(connection, { invoice_supplier_id })

  const users = await getUserNotifyActive(connection, {
    branch_id: invoice_supplier.branch_id,
    event_key: 'payment',
  })

  return {
    notifys: [{
      notify_title: `ใบ ${invoice_supplier.invoice_supplier_origin_id} มีการชำระแล้ว`,
      notify_detail: `เมื่อ ${formatDate(new Date(), 'HH:mm dd/MM/yyyy')} - ${invoice_supplier.invoice_supplier_branch_name}`,
      notify_url: `${process.env.WEB_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier.invoice_supplier_id}`,
      notify_lv: 'success',
    }],
    target: {
      user_ids: users.map(item => item.user_id),
    },
  }
}

const paymentInvalid = async (connection, data) => {
  const { invoice_supplier_id } = data

  const invoice_supplier = await InvoiceSupplierModel.getInvoiceSupplierByID(connection, { invoice_supplier_id })

  const users = await getUserNotifyActive(connection, {
    branch_id: invoice_supplier.branch_id,
    event_key: 'payment',
  })

  return {
    notifys: [{
      notify_title: `ใบ ${invoice_supplier.invoice_supplier_origin_id} ยอดชำระไม่ถูกต้อง`,
      notify_detail: `เมื่อ ${formatDate(new Date(), 'HH:mm dd/MM/yyyy')} - ${invoice_supplier.invoice_supplier_branch_name}`,
      notify_url: `${process.env.WEB_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier.invoice_supplier_id}`,
      notify_lv: 'error',
    }],
    target: {
      user_ids: users.map(item => item.user_id),
    },
  }
}

module.exports = {
  'payment:paid': paymentPaid,
  'payment:invalid': paymentInvalid,
}