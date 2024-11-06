const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { ReportProductController } = require("@/controllers");

const scope = 'report-product'

router.post("/getReportProductInvoiceBy", authJwt.protect(), ReportProductController.getReportProductInvoiceBy)

module.exports = router