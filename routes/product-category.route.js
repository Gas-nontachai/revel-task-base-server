const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { ProductCategoryController } = require("@/controllers");

const scope = 'product-category'

router.post("/generateProductCategoryID", authJwt.protect(), ProductCategoryController.generateProductCategoryID)
router.post("/getProductCategoryBy", authJwt.protect(), ProductCategoryController.getProductCategoryBy)
router.post("/getProductCategoryByID", authJwt.protect(), ProductCategoryController.getProductCategoryByID)

router.post(
  "/insertProductCategory",
  authJwt.protect(scope, ['add']),
  ProductCategoryController.insertProductCategory
)
router.post(
  "/updateProductCategoryBy",
  authJwt.protect(scope, ['edit']),
  ProductCategoryController.updateProductCategoryBy
)
router.post(
  "/deleteProductCategoryBy",
  authJwt.protect(scope, ['delete']),
  ProductCategoryController.deleteProductCategoryBy
)

module.exports = router
