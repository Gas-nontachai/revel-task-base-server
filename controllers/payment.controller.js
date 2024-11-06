const Task = function (task) { this.task = task.task }

const { PaymentModel, } = require('@/models')
const { InvoiceSupplierService, PaymentService, } = require('@/services')

Task.getPaymentBy = (req) => req.useConnection((connection) => PaymentService.getPaymentBy(connection, req.body))
Task.getPaymentByID = (req) => req.useConnection((connection) => PaymentModel.getPaymentByID(connection, req.body))

Task.confirmPayment = (req) => req.useTransaction(async (connection) => {
  const { payment } = await PaymentService.confirmPayment(connection, req.body)

  await InvoiceSupplierService.updateInvoiceSupplierPaidBy(connection, { payment })
})

module.exports = Task