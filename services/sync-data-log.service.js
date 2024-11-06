const Task = function (task) { this.task = task.task }

const {
  SyncDataLogModel,
} = require("@/models")

Task.getSyncDataLogBy = (connection, data) => SyncDataLogModel.getSyncDataLogBy(connection, data)

Task.insertSyncDataLog = async (connection, data) => {
  const {
    sync_data_id,
    current_sync_time,
    last_sync_time,
    sync_data_result,
    sync_data_error,
  } = data

  await SyncDataLogModel.insertSyncDataLog(connection, {
    sync_data_log_id: await SyncDataLogModel.generateSyncDataLogID(connection),
    sync_data_id,
    sync_data_start_date: last_sync_time,
    sync_data_end_date: current_sync_time,
    sync_data_result,
    sync_data_error,
  })
}

module.exports = Task