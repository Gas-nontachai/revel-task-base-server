const Task = function (task) { this.task = task.task }

const { InvoiceSupplierService } = require('@/services')

Task.generateInvoiceSupplierID = (req) => req.useConnection((connection) => InvoiceSupplierService.generateInvoiceSupplierID(connection, req.body))
Task.getInvoiceSupplierBy = (req) => req.useConnection((connection) => InvoiceSupplierService.getInvoiceSupplierBy(connection, req.body))
Task.getInvoiceSupplierByID = (req) => req.useConnection((connection) => InvoiceSupplierService.getInvoiceSupplierByID(connection, req.body))
Task.getSumInvoiceSupplierBy = (req) => req.useConnection((connection) => InvoiceSupplierService.getSumInvoiceSupplierBy(connection, req.body))

Task.mergeInvoiceSupplier = (req) => req.useTransaction((connection) => InvoiceSupplierService.mergeInvoiceSupplier(connection, req.body))
Task.insertInvoiceSupplier = (req) => req.useTransaction((connection) => InvoiceSupplierService.insertInvoiceSupplier(connection, req.body))
Task.updateInvoiceSupplierBy = (req) => req.useTransaction((connection) => InvoiceSupplierService.updateInvoiceSupplierBy(connection, req.body))
Task.deleteInvoiceSupplierBy = (req) => req.useTransaction((connection) => InvoiceSupplierService.deleteInvoiceSupplierBy(connection, req.body))

module.exports = Task
