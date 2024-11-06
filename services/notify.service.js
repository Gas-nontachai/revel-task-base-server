const Task = function (task) { this.task = task.task }

const {
  NotifyModel,
  OnesignalPlayerModel,
} = require('@/models')

async function getMyNoti(connection) {
  const { docs: notifys } = await NotifyModel.getMyNotifyBy(connection, {
    pagination: { page: 1, size: 20, }
  })

  const menu_noti = {}

  // menu_noti['invoice-supplier'] = await InvoiceSupplierModel.getInvoiceSupplierBy(connection, {
  //   count: true,
  //   match: { invoice_supplier_status: { $nin: ['invalid', 'paid'] } },
  // })

  return {
    notifys,
    menu_noti,
  }
}

async function getInitNotify(connection, data) {
  const { player_id } = data

  const { docs: players } = await OnesignalPlayerModel.getOnesignalPlayerBy(connection, {
    match: { player_id },
  })

  if (!players.length) {
    await OnesignalPlayerModel.insertOnesignalPlayer(connection, { player_id, })

    return { subscription: true }
  }

  await OnesignalPlayerModel.updateLastActiveBy(connection, { player_id })

  return { subscription: players[0].subscription, }
}

Task.getMyNoti = getMyNoti
Task.getInitNotify = getInitNotify

module.exports = Task