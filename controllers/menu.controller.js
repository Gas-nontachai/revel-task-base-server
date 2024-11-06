const Task = function (task) { this.task = task.task }

const { MenuModel, } = require('@/models')

Task.getMenuBy = (req) => req.useConnection((connection) => MenuModel.getMenuBy(connection, req.body))
Task.getMenuPermissionBy = (req) => req.useConnection((connection) => MenuModel.getMenuPermissionBy(connection, req.body))

module.exports = Task