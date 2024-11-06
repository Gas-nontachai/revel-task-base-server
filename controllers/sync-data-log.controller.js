const Task = function (task) { this.task = task.task }

const { SyncDataLogService, } = require('@/services')

Task.getSyncDataLogBy = (req) => req.useConnection((connection) => SyncDataLogService.getSyncDataLogBy(connection, req.body))

module.exports = Task