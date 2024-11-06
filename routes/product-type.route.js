const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { ProductTypeController } = require("@/controllers");

const scope = 'product-type'

router.post("/generateProductTypeID", authJwt.protect(), ProductTypeController.generateProductTypeID)
router.post("/getProductTypeBy", authJwt.protect(), ProductTypeController.getProductTypeBy)
router.post("/getProductTypeByID", authJwt.protect(), ProductTypeController.getProductTypeByID)

router.post(
  "/insertProductType",
  authJwt.protect(scope, ['add']),
  ProductTypeController.insertProductType
)
router.post(
  "/updateProductTypeBy",
  authJwt.protect(scope, ['edit']),
  ProductTypeController.updateProductTypeBy
)
router.post(
  "/deleteProductTypeBy",
  authJwt.protect(scope, ['delete']),
  ProductTypeController.deleteProductTypeBy
)

module.exports = router