const Task = function (task) { this.task = task.task }

const { AuthService, } = require('@/services')

Task.login = (req) => req.useConnection((connection) => AuthService.login(connection, req.body))
Task.refresh = (req) => req.useConnection((connection) => AuthService.refresh(connection, req.body))
Task.getMyCredential = (req) => req.useConnection((connection) => AuthService.getMyCredential(connection))
Task.changePassword = (req) => req.useConnection((connection) => AuthService.changePassword(connection, req.body))

module.exports = Task