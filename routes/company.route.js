const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { CompanyController } = require("@/controllers");

const scope = 'company'

router.post("/generateCompanyID", authJwt.protect(), CompanyController.generateCompanyID)
router.post("/getCompanyBy", authJwt.protect(), CompanyController.getCompanyBy)
router.post("/getCompanyByID", authJwt.protect(), CompanyController.getCompanyByID)

router.post(
  "/insertCompany",
  authJwt.protect(scope, ['add']),
  CompanyController.insertCompany
)
router.post(
  "/updateCompanyBy",
  authJwt.protect(scope, ['edit']),
  CompanyController.updateCompanyBy)

router.post(
  "/deleteCompanyBy",
  authJwt.protect(scope, ['delete']),
  CompanyController.deleteCompanyBy
)

module.exports = router