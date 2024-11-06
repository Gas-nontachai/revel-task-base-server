const Task = function (task) { this.task = task.task }

const { BookBankBranchService, } = require('@/services')

Task.getBookBankBranchBy = (req) => req.useConnection((connection) => BookBankBranchService.getBookBankBranchBy(connection, req.body))

module.exports = Task