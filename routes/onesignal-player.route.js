const router = require('express').Router()

const { authJwt, } = require("@/middlewares");

const { OnesignalPlayerController } = require("@/controllers");

router.post("/updateOnesignalPlayerBy", authJwt.protect(), OnesignalPlayerController.updateOnesignalPlayerBy)

module.exports = router