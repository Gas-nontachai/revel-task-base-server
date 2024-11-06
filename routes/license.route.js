const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { LicenseController } = require("@/controllers")

const scope = 'license'

router.post("/generateLicenseID", authJwt.protect(), LicenseController.generateLicenseID)
router.post("/getLicenseBy", authJwt.protect(), LicenseController.getLicenseBy)
router.post("/getLicenseByID", authJwt.protect(), LicenseController.getLicenseByID)

router.post(
  "/insertLicense",
  authJwt.protect(scope, ['add']),
  LicenseController.insertLicense
)
router.post(
  "/updateLicenseBy",
  authJwt.protect(scope, ['edit']),
  LicenseController.updateLicenseBy
)
router.post(
  "/deleteLicenseBy",
  authJwt.protect(scope, ['delete']),
  LicenseController.deleteLicenseBy
)

module.exports = router