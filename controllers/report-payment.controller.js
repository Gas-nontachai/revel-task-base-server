const Task = function (task) { this.task = task.task }

const { ReportPaymentService, } = require('@/services')

Task.getReportPaymentBy = (req) => req.useConnection((connection) => ReportPaymentService.getReportPaymentBy(connection, req.body))

module.exports = Task
