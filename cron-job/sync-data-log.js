const Task = function (task) { this.task = task.task }

const { useConnection } = require('@/utils/db-helper')

const { SyncDataLogModel, } = require('@/models');

Task.deleteExpired = () => useConnection(async connection => {
  const expire_date = new Date()
  const keep_day = process.env.KEEP_LOG_DAY || 30

  expire_date.setDate(expire_date.getDate() - keep_day)

  await SyncDataLogModel.deleteSyncDataLogBy(connection, { match: { sync_data_start_date: { $lte: expire_date }, }, })
})

module.exports = Task