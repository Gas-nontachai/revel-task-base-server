const Task = function (task) { this.task = task.task }

const {
  BookBankModel,
  PaymentModel,
  PaymentLogModel,
} = require("@/models")

const { isChange } = require('@/utils/payment-helper')

Task.getPaymentBy = async (connection, data) => {
  const { options = [] } = data

  const payments = await PaymentModel.getPaymentBy(connection, data)

  if (options.length) {
    for (const payment of payments.docs) {
      if (options.includes('book_bank')) {
        payment.book_bank = await BookBankModel.getBookBankByID(connection, {
          book_bank_id: payment.book_bank_id,
          required: false,
        })
      }
    }
  }

  return payments
}
Task.getPaymentByID = (connection, data) => PaymentModel.getPaymentByID(connection, data)

Task.confirmPayment = async (connection, data) => {
  const { invoice_supplier_id } = data

  const payment_old = await PaymentModel.getPaymentBy(connection, { match: { invoice_supplier_id } }).then(res => res.docs[0])

  const payment_log = {}
  if (payment_old) {
    const { payment_id } = payment_old

    await PaymentModel.updatePaymentBy(connection, { ...data, payment_id })

    if (isChange(payment_old, data)) {
      payment_log.payment_id = payment_id
      payment_log.payment_log_event = "update"
      payment_log.payment_log_text = JSON.stringify(data)
    }
  } else {
    const { data: payment_id } = await PaymentModel.insertPayment(connection, data)

    payment_log.payment_id = payment_id
    payment_log.payment_log_event = "insert"
    payment_log.payment_log_text = JSON.stringify(data)
  }

  if (payment_log.payment_log_event) {
    await PaymentLogModel.insertPaymentLog(connection, payment_log)
  }

  return { payment: data }
}

module.exports = Task