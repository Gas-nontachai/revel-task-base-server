const Task = function (task) { this.task = task.task }

const { PaymentLogModel } = require('@/models')

Task.getPaymentLogBy = (req) => req.useConnection((connection) => PaymentLogModel.getPaymentLogBy(connection, req.body))

module.exports = Task