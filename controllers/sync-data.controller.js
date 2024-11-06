const Task = function (task) { this.task = task.task }

const { SyncDataService, } = require('@/services')

Task.getSyncDataBy = (req) => req.useConnection((connection) => SyncDataService.getSyncDataBy(connection, req.body))
Task.registerToSync = (req) => req.useConnection((connection) => SyncDataService.registerToSync(connection, req.body))
Task.preSyncData = (req) => req.useConnection((connection) => SyncDataService.preSyncData(connection, req.body))

module.exports = Task