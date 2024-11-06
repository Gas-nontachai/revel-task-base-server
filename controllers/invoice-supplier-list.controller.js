const Task = function (task) { this.task = task.task }

const { InvoiceSupplierListModel, } = require('@/models')

Task.getInvoiceSupplierListBy = (req) => req.useConnection((connection) => InvoiceSupplierListModel.getInvoiceSupplierListBy(connection, req.body))

module.exports = Task