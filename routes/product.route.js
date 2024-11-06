const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { ProductController } = require("@/controllers");

const scope = 'product'

router.post("/generateProductID", authJwt.protect(), ProductController.generateProductID)
router.post("/getProductBy", authJwt.protect(), ProductController.getProductBy)
router.post("/getProductByID", authJwt.protect(), ProductController.getProductByID)

router.post(
  "/insertProduct",
  authJwt.protect(scope, ['add']),
  ProductController.insertProduct
)
router.post(
  "/updateSameProductBy",
  authJwt.protect(scope, ['edit']),
  ProductController.updateSameProductBy
)
router.post(
  "/updateProductBy",
  authJwt.protect(scope, ['edit']),
  ProductController.updateProductBy
)
router.post(
  "/deleteProductBy",
  authJwt.protect(scope, ['delete']),
  ProductController.deleteProductBy
)

module.exports = router