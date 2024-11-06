const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { UserBranchController } = require("@/controllers")

router.post("/getUserBranchBy", authJwt.protect(), UserBranchController.getUserBranchBy)

module.exports = router