const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { SyncDataLogController } = require("@/controllers");

router.post("/getSyncDataLogBy", authJwt.protect(), SyncDataLogController.getSyncDataLogBy)

module.exports = router