const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { ReportInvoiceController } = require("@/controllers");

const scope = 'report-invoice'

router.post("/getReportSupplierInvoiceBy", authJwt.protect(), ReportInvoiceController.getReportSupplierInvoiceBy)

module.exports = router