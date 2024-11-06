const Task = function (task) { this.task = task.task }

const { CompanyService, } = require('@/services')

Task.generateCompanyID = (req) => req.useConnection((connection) => CompanyService.generateCompanyID(connection, req.body))
Task.getCompanyBy = (req) => req.useConnection((connection) => CompanyService.getCompanyBy(connection, req.body))
Task.getCompanyByID = (req) => req.useConnection((connection) => CompanyService.getCompanyByID(connection, req.body))

Task.insertCompany = (req) => req.useConnection((connection) => CompanyService.insertCompany(connection, req.body))
Task.updateCompanyBy = (req) => req.useConnection((connection) => CompanyService.updateCompanyBy(connection, req.body))
Task.deleteCompanyBy = (req) => req.useTransaction((connection) => CompanyService.deleteCompanyBy(connection, req.body))

module.exports = Task
