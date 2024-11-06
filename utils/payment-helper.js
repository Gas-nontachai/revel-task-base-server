const { isChange } = require("./misc-helper");

const column = {
  dates: [
    'payment_date',
  ],
  texts: [
    'book_bank_id',
    'invoice_supplier_id',
    'user_id',
    'payment_type',
    'payment_price',
    'payment_vat_price',
    'payment_net_price',
    'payment_remark',
    'payment_slip_url',
  ],
}

module.exports = {
  isChange: (a, b) => isChange(a, b, column),
}