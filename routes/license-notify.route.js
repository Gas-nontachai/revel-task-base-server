const router = require('express').Router()

const { authJwt, } = require("@/middlewares");

const { LicenseNotifyController } = require("@/controllers");

router.post("/getLicenseNotifyBy", authJwt.protect(), LicenseNotifyController.getLicenseNotifyBy)

module.exports = router