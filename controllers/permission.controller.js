const Task = function (task) { this.task = task.task }

const { PermissionModel, } = require('@/models')

Task.getPermissionBy = (req) => req.useConnection((connection) => PermissionModel.getPermissionBy(connection, req.body))

module.exports = Task