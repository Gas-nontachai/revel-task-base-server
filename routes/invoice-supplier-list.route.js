const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { InvoiceSupplierListController } = require("@/controllers");

const scope = 'invoice-supplier'

router.post("/getInvoiceSupplierListBy", authJwt.protect(scope), InvoiceSupplierListController.getInvoiceSupplierListBy)

module.exports = router