const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { SyncDataController } = require("@/controllers");

router.post("/getSyncDataBy", authJwt.protect(), SyncDataController.getSyncDataBy)
router.post("/registerToSync", SyncDataController.registerToSync)
router.post("/syncData", SyncDataController.preSyncData)

module.exports = router