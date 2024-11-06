const Task = function (task) { this.task = task.task }

const { BankModel, } = require('@/models')

Task.getBankBy = (req) => req.useConnection((connection) => BankModel.getBankBy(connection, req.body))
Task.getBankByID = (req) => req.useConnection((connection) => BankModel.getBankByID(connection, req.body))

Task.insertBank = (req) => req.useConnection((connection) => BankModel.insertBank(connection, req.body))
Task.updateBankBy = (req) => req.useConnection((connection) => BankModel.updateBankBy(connection, req.body))
Task.deleteBankBy = (req) => req.useConnection((connection) => BankModel.deleteBankBy(connection, req.body))

module.exports = Task
