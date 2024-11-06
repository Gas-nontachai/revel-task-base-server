const router = require('express').Router()

const { authJwt, } = require("@/middlewares");

const { NotifyController } = require("@/controllers");

router.post("/getMyNoti", authJwt.protect(), NotifyController.getMyNoti)
router.post("/getNotifyBy", authJwt.protect(), NotifyController.getNotifyBy)
router.post("/getInitNotify", authJwt.protect(), NotifyController.getInitNotify)

router.post("/seenNotifyBy", authJwt.protect(), NotifyController.seenNotifyBy)
router.post("/deleteNotifyBy", authJwt.protect(), NotifyController.deleteNotifyBy)

module.exports = router