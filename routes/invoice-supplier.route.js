const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { InvoiceSupplierController } = require("@/controllers");

const scope = 'invoice-supplier'

router.post("/generateInvoiceSupplierID", authJwt.protect(), InvoiceSupplierController.generateInvoiceSupplierID)
router.post("/getInvoiceSupplierBy", authJwt.protect(), InvoiceSupplierController.getInvoiceSupplierBy)
router.post("/getInvoiceSupplierByID", authJwt.protect(), InvoiceSupplierController.getInvoiceSupplierByID)
router.post("/getSumInvoiceSupplierBy", authJwt.protect(), InvoiceSupplierController.getSumInvoiceSupplierBy)

router.post(
  "/mergeInvoiceSupplier",
  authJwt.protect(scope, ['add', 'edit']),
  InvoiceSupplierController.mergeInvoiceSupplier
)
router.post(
  "/insertInvoiceSupplier",
  authJwt.protect(scope, ['add']),
  InvoiceSupplierController.insertInvoiceSupplier
)
router.post(
  "/updateInvoiceSupplierBy",
  authJwt.protect(scope, ['edit']),
  InvoiceSupplierController.updateInvoiceSupplierBy
)
router.post(
  "/deleteInvoiceSupplierBy",
  authJwt.protect(scope, ['delete']),
  InvoiceSupplierController.deleteInvoiceSupplierBy
)

module.exports = router