const Task = function (task) { this.task = task.task }

const { SupplierService, } = require('@/services')

Task.generateSupplierID = (req) => req.useConnection((connection) => SupplierService.generateSupplierID(connection, req.body))
Task.getSupplierBy = (req) => req.useConnection((connection) => SupplierService.getSupplierBy(connection, req.body))
Task.getSupplierByID = (req) => req.useConnection((connection) => SupplierService.getSupplierByID(connection, req.body))

Task.insertSupplier = (req) => req.useTransaction((connection) => SupplierService.insertSupplier(connection, req.body))
Task.updateSupplierBy = (req) => req.useTransaction((connection) => SupplierService.updateSupplierBy(connection, req.body))
Task.updateSameSupplierBy = (req) => req.useTransaction((connection) => SupplierService.updateSameSupplierBy(connection, req.body))
Task.deleteSupplierBy = (req) => req.useTransaction((connection) => SupplierService.deleteSupplierBy(connection, req.body))

module.exports = Task
