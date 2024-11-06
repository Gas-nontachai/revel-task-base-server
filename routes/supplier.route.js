const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { SupplierController } = require("@/controllers");

const scope = 'supplier'

router.post("/generateSupplierID", authJwt.protect(), SupplierController.generateSupplierID)
router.post("/getSupplierBy", authJwt.protect(), SupplierController.getSupplierBy)
router.post("/getSupplierByID", authJwt.protect(), SupplierController.getSupplierByID)

router.post(
  "/insertSupplier",
  authJwt.protect(scope, ['add']),
  SupplierController.insertSupplier
)
router.post(
  "/updateSupplierBy",
  authJwt.protect(scope, ['edit']),
  SupplierController.updateSupplierBy
)
router.post(
  "/updateSameSupplierBy",
  authJwt.protect(scope, ['edit']),
  SupplierController.updateSameSupplierBy
)
router.post(
  "/deleteSupplierBy",
  authJwt.protect(scope, ['delete']),
  SupplierController.deleteSupplierBy
)

module.exports = router