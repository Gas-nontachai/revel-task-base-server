const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { PaymentLogController } = require("@/controllers");

router.post("/getPaymentLogBy", authJwt.protect(), PaymentLogController.getPaymentLogBy)

module.exports = router