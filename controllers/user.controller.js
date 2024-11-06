const Task = function (task) { this.task = task.task }

const { UserService, } = require('@/services')

Task.generateUserID = (req) => req.useConnection((connection) => UserService.generateUserID(connection, req.body))
Task.getUserBy = (req) => req.useConnection((connection) => UserService.getUserBy(connection, req.body))
Task.getUserByID = (req) => req.useConnection((connection) => UserService.getUserByID(connection, req.body))

Task.insertUser = (req) => req.useConnection((connection) => UserService.insertUser(connection, req.body))
Task.updateUserBy = (req) => req.useConnection((connection) => UserService.updateUserBy(connection, req.body))
Task.updatePasswordUserBy = (req) => req.useConnection((connection) => UserService.updatePasswordUserBy(connection, req.body))
Task.deleteUserBy = (req) => req.useConnection((connection) => UserService.deleteUserBy(connection, req.body))

module.exports = Task
