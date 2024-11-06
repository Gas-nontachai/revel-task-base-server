const Task = function (task) { this.task = task.task }

const { ProductCategoryModel, } = require('@/models')

Task.generateProductCategoryID = (req) => req.useConnection((connection) => ProductCategoryModel.generateProductCategoryID(connection, req.body))
Task.getProductCategoryBy = (req) => req.useConnection((connection) => ProductCategoryModel.getProductCategoryBy(connection, req.body))
Task.getProductCategoryByID = (req) => req.useConnection((connection) => ProductCategoryModel.getProductCategoryByID(connection, req.body))

Task.insertProductCategory = (req) => req.useConnection((connection) => ProductCategoryModel.insertProductCategory(connection, req.body))
Task.updateProductCategoryBy = (req) => req.useConnection((connection) => ProductCategoryModel.updateProductCategoryBy(connection, req.body))
Task.deleteProductCategoryBy = (req) => req.useConnection((connection) => ProductCategoryModel.deleteProductCategoryBy(connection, req.body))

module.exports = Task