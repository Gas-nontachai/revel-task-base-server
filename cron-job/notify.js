const Task = function (task) { this.task = task.task }

const { useConnection } = require('@/utils/db-helper')

const { NotifyModel, NotifyRecipientModel, } = require('@/models');

Task.deleteExpired = () => useConnection(async connection => {
  const expire_date = new Date()
  const keep_day = process.env.KEEP_LOG_DAY || 30

  expire_date.setDate(expire_date.getDate() - keep_day)

  const { docs: notifys } = await NotifyModel.getNotifyBy(connection, {
    match: { adddate: { $lte: expire_date }, },
  })

  const notify_ids = notifys.map(item => item.notify_id)

  for (const notify_id of notify_ids) {
    await NotifyModel.deleteNotifyBy(connection, { match: { notify_id, } })
    await NotifyRecipientModel.deleteNotifyRecipientBy(connection, { match: { notify_id, } })
  }
})

module.exports = Task