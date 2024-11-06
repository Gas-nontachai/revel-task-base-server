const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { BookBankBranchController } = require("@/controllers")

router.post("/getBookBankBranchBy", authJwt.protect(), BookBankBranchController.getBookBankBranchBy)

module.exports = router