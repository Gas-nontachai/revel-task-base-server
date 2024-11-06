const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { PaymentController } = require("@/controllers");

const scope = 'invoice-supplier'

router.post("/getPaymentBy", authJwt.protect(), PaymentController.getPaymentBy)
router.post("/getPaymentByID", authJwt.protect(), PaymentController.getPaymentByID)

router.post(
  "/confirmPayment",
  authJwt.protect(scope, ['add', 'edit', 'approve']),
  PaymentController.confirmPayment
)

module.exports = router