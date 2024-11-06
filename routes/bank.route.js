const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { BankController } = require("@/controllers");

const scope = 'bank'

router.post("/getBankBy", authJwt.protect(), BankController.getBankBy)
router.post("/getBankByID", authJwt.protect(), BankController.getBankByID)

router.post(
  "/insertBank",
  authJwt.protect(scope, ['add']),
  BankController.insertBank
)
router.post(
  "/updateBankBy",
  authJwt.protect(scope, ['edit']),
  BankController.updateBankBy
)
router.post(
  "/deleteBankBy",
  authJwt.protect(scope, ['delete']),
  BankController.deleteBankBy
)

module.exports = router