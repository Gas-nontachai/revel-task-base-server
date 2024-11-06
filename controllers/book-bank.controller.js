const Task = function (task) { this.task = task.task }

const { BookBankService, } = require('@/services')

Task.generateBookBankID = (req) => req.useConnection((connection) => BookBankService.generateBookBankID(connection, req.body))
Task.getBookBankBy = (req) => req.useConnection((connection) => BookBankService.getBookBankBy(connection, req.body))
Task.getBookBankByID = (req) => req.useConnection((connection) => BookBankService.getBookBankByID(connection, req.body))
Task.getPaymentBookBankBy = (req) => req.useConnection((connection) => BookBankService.getPaymentBookBankBy(connection, req.body))

Task.insertBookBank = (req) => req.useConnection((connection) => BookBankService.insertBookBank(connection, req.body))
Task.updateBookBankBy = (req) => req.useConnection((connection) => BookBankService.updateBookBankBy(connection, req.body))
Task.deleteBookBankBy = (req) => req.useConnection((connection) => BookBankService.deleteBookBankBy(connection, req.body))

module.exports = Task
