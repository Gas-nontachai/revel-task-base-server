const Task = function (task) { this.task = task.task }

const { ProductTypeModel, } = require('@/models')

Task.generateProductTypeID = (req) => req.useConnection((connection) => ProductTypeModel.generateProductTypeID(connection, req.body))
Task.getProductTypeBy = (req) => req.useConnection((connection) => ProductTypeModel.getProductTypeBy(connection, req.body))
Task.getProductTypeByID = (req) => req.useConnection((connection) => ProductTypeModel.getProductTypeByID(connection, req.body))

Task.insertProductType = (req) => req.useConnection((connection) => ProductTypeModel.insertProductType(connection, req.body))
Task.updateProductTypeBy = (req) => req.useConnection((connection) => ProductTypeModel.updateProductTypeBy(connection, req.body))
Task.deleteProductTypeBy = (req) => req.useConnection((connection) => ProductTypeModel.deleteProductTypeBy(connection, req.body))

module.exports = Task