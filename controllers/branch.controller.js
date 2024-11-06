const Task = function (task) { this.task = task.task }

const { BranchService, } = require('@/services')

Task.generateBranchID = (req) => req.useConnection((connection) => BranchService.generateBranchID(connection, req.body))
Task.getBranchBy = (req) => req.useConnection((connection) => BranchService.getBranchBy(connection, req.body))
Task.getBranchByID = (req) => req.useConnection((connection) => BranchService.getBranchByID(connection, req.body))

Task.insertBranch = (req) => req.useTransaction((connection) => BranchService.insertBranch(connection, req.body))
Task.updateBranchBy = (req) => req.useTransaction((connection) => BranchService.updateBranchBy(connection, req.body))
Task.deleteBranchBy = (req) => req.useTransaction((connection) => BranchService.deleteBranchBy(connection, req.body))

module.exports = Task