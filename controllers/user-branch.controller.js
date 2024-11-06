const Task = function (task) { this.task = task.task }

const { UserBranchService, } = require('@/services')

Task.getUserBranchBy = (req) => req.useConnection((connection) => UserBranchService.getUserBranchBy(connection, req.body))

module.exports = Task