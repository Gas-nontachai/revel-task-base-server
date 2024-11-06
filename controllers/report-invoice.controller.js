const Task = function (task) { this.task = task.task }

const { ReportInvoiceService, } = require('@/services')

Task.getReportSupplierInvoiceBy = (req) => req.useConnection((connection) => ReportInvoiceService.getReportSupplierInvoiceBy(connection, req.body))

module.exports = Task
