const { isChange } = require("./misc-helper");

const column = {
  dates: [
    'invoice_supplier_date',
  ],
  numbers: [
    'invoice_supplier_weight',
    'invoice_supplier_net_price',
  ],
  texts: [
    'supplier_id',
    'invoice_supplier_account',
    'invoice_supplier_license_plate',
    'invoice_supplier_paid_type',
  ],
}

module.exports = {
  isChange: (a, b) => isChange(a, b, column),
}