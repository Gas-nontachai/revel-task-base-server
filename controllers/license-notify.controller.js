const Task = function (task) { this.task = task.task }

const { LicenseNotifyModel } = require('@/models')

Task.getLicenseNotifyBy = (req) => req.useConnection((connection) => LicenseNotifyModel.getLicenseNotifyBy(connection, req.body))

module.exports = Task