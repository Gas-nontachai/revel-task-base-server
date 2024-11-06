const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { ReportPaymentController } = require("@/controllers");

const scope = 'report-payment'

router.post("/getReportPaymentBy", authJwt.protect(), ReportPaymentController.getReportPaymentBy)

module.exports = router