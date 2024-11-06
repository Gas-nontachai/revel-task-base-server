const { getUserNotifyActive } = require("@/utils/auth-helper")
const { formatDate } = require('@/utils/date-helper')

const addInvoice = async (connection, data = []) => {
  if (!data.length) return

  const users = await getUserNotifyActive(connection, {
    branch_id: data[0].invoice_supplier.branch_id,
    event_key: 'sync-data:add-invoice',
  })

  return {
    notifys: data.map(item => {
      const {
        invoice_supplier_id,
        invoice_supplier_origin_id,
        invoice_supplier_branch_name,
      } = item.invoice_supplier

      return {
        notify_title: `มีรายการใหม่ ${invoice_supplier_origin_id}`,
        notify_detail: invoice_supplier_branch_name,
        notify_url: `${process.env.TT_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier_id}`,
      }
    }),
    target: {
      user_ids: users.map(item => item.user_id),
    },
  }
}

const updateInvoice = async (connection, data = []) => {
  if (!data.length) return

  const users = await getUserNotifyActive(connection, {
    branch_id: data[0].invoice_supplier.branch_id,
    event_key: 'sync-data:update-invoice',
  })

  return {
    notifys: data.map(item => {
      const {
        invoice_supplier_id,
        invoice_supplier_origin_id,
        invoice_supplier_branch_name,
      } = item.invoice_supplier

      return {
        notify_title: `มีการอัปเดตใบ ${invoice_supplier_origin_id}`,
        notify_detail: `เมื่อ ${formatDate(new Date(), 'HH:mm dd/MM/yyyy')} - ${invoice_supplier_branch_name}`,
        notify_url: `${process.env.TT_CLIENT_URL}/invoice-supplier/detail?id=${invoice_supplier_id}`,
        notify_lv: 'warning',
      }
    }),
    target: {
      user_ids: users.map(item => item.user_id),
    },
  }
}

module.exports = {
  'sync-data:add-invoice': addInvoice,
  'sync-data:update-invoice': updateInvoice,
}