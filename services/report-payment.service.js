const Task = function (task) { this.task = task.task }

const { PaymentModel } = require("@/models")

Task.getReportPaymentBy = async (connection, data) => {
  const { match, search, } = data

  const { docs: payments } = await PaymentModel.getReportPaymentBy(connection, {
    search,
    match,
  })

  const report_payments = []
  payments.forEach(payment => {
    const payment_date = new Date(payment.payment_date)

    const report_payment_date = payment_date.toISOString().split('T')[0]

    const report_payment = report_payments.find(val => val.report_payment_date === report_payment_date)

    if (report_payment) {
      if (payment.payment_type === 'ธนาคาร') {
        report_payment.bank_payments.push(payment)
      } else if (payment.payment_type === 'เงินสด') {
        report_payment.cash_payments.push(payment)
      } else if (payment.payment_type === 'เงินเชื่อ') {
        report_payment.credit_payments.push(payment)
      } else if (payment.payment_type === 'เงินโอน') {
        report_payment.transfer_payments.push(payment)
      } else {
        report_payment.payments.push(payment)
      }
    } else {
      const new_item = {
        report_payment_date,
        bank_payments: [],
        cash_payments: [],
        credit_payments: [],
        transfer_payments: [],
        payments: [],
      }

      if (payment.payment_type === 'ธนาคาร') {
        new_item.bank_payments.push(payment)
      } else if (payment.payment_type === 'เงินสด') {
        new_item.cash_payments.push(payment)
      } else if (payment.payment_type === 'เงินเชื่อ') {
        new_item.credit_payments.push(payment)
      } else if (payment.payment_type === 'เงินโอน') {
        new_item.transfer_payments.push(payment)
      } else {
        new_item.payments.push(payment)
      }

      report_payments.push(new_item)
    }
  });

  return report_payments
}

module.exports = Task