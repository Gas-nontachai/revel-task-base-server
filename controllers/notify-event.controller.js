const Task = function (task) { this.task = task.task }

const { NotifyEventModel } = require('@/models')

Task.getNotifyEventBy = (req) => req.useConnection((connection) => NotifyEventModel.getNotifyEventBy(connection, req.body))

module.exports = Task