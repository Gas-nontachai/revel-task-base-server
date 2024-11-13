const Task = function (task) { this.task = task.task }

const { TaskService } = require('@/services')

Task.generateTaskID = (req) => req.useConnection((connection) => TaskService.generateTaskID(connection, req.body))
Task.getTaskBy = (req) => req.useConnection((connection) => TaskService.getTaskBy(connection, req.body))
Task.getTaskByID = (req) => req.useConnection((connection) => TaskService.getTaskByID(connection, req.body))

Task.insertTask = (req) => req.useConnection((connection) => TaskService.insertTask(connection, req.body))
Task.updateTaskBy = (req) => req.useConnection((connection) => TaskService.updateTaskBy(connection, req.body))
Task.deleteTaskBy = (req) => req.useConnection((connection) => TaskService.deleteTaskBy(connection, req.body))

module.exports = Task
