const Task = function (task) { this.task = task.task }

const { ReportProductService, } = require('@/services')

Task.getReportProductInvoiceBy = (req) => req.useConnection((connection) => ReportProductService.getReportProductInvoiceBy(connection, req.body))

module.exports = Task
