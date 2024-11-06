const Task = function (task) { this.task = task.task }

const { PaymentLogModel, } = require("@/models")

Task.getPaymentLogBy = (connection, data) => PaymentLogModel.getPaymentLogBy(connection, data)

module.exports = Task