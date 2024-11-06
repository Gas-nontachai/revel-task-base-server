const Task = function (task) { this.task = task.task }

const { ProductModel, } = require('@/models')
const { ProductService, } = require('@/services')

Task.generateProductID = (req) => req.useConnection((connection) => ProductModel.generateProductID(connection, req.body))
Task.getProductBy = (req) => req.useConnection((connection) => ProductService.getProductBy(connection, req.body))
Task.getProductByID = (req) => req.useConnection((connection) => ProductModel.getProductByID(connection, req.body))

Task.insertProduct = (req) => req.useTransaction((connection) => ProductService.insertProduct(connection, req.body))
Task.updateProductBy = (req) => req.useTransaction((connection) => ProductService.updateProductBy(connection, req.body))
Task.updateSameProductBy = (req) => req.useTransaction((connection) => ProductService.updateSameProductBy(connection, req.body))
Task.deleteProductBy = (req) => req.useTransaction((connection) => ProductService.deleteProductBy(connection, req.body))

module.exports = Task