const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { BookBankController } = require("@/controllers");

const scope = 'book-bank'

router.post("/generateBookBankID", authJwt.protect(), BookBankController.generateBookBankID)
router.post("/getBookBankBy", authJwt.protect(), BookBankController.getBookBankBy)
router.post("/getBookBankByID", authJwt.protect(), BookBankController.getBookBankByID)
router.post("/getPaymentBookBankBy", authJwt.protect(), BookBankController.getPaymentBookBankBy)

router.post(
  "/insertBookBank",
  authJwt.protect(scope, ['add']),
  BookBankController.insertBookBank
)
router.post(
  "/updateBookBankBy",
  authJwt.protect(scope, ['edit']),
  BookBankController.updateBookBankBy)
router.post(
  "/deleteBookBankBy",
  authJwt.protect(scope, ['delete']),
  BookBankController.deleteBookBankBy
)

module.exports = router