const router = require('express').Router()

const { authJwt, } = require("@/middlewares");

const { NotifyEventController } = require("@/controllers");

router.post("/getNotifyEventBy", authJwt.protect(), NotifyEventController.getNotifyEventBy)

module.exports = router