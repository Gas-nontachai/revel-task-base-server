const Task = function (task) { this.task = task.task }

const { ProjectService, } = require('@/services')

Task.generateProjectID = (req) => req.useConnection((connection) => ProjectService.generateProjectID(connection, req.body))
Task.getProjectBy = (req) => req.useConnection((connection) => ProjectService.getProjectBy(connection, req.body))
Task.getProjectByID = (req) => req.useConnection((connection) => ProjectService.getProjectByID(connection, req.body))
Task.getProjectTaskByID = (req) => req.useConnection((connection) => ProjectService.getProjectTaskByID(connection, req.body))

Task.insertProject = (req) => req.useConnection((connection) => ProjectService.insertProject(connection, req.body))
Task.updateProjectBy = (req) => req.useConnection((connection) => ProjectService.updateProjectBy(connection, req.body))
Task.deleteProjectBy = (req) => req.useConnection((connection) => ProjectService.deleteProjectBy(connection, req.body))

module.exports = Task
