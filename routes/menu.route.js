const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { MenuController } = require("@/controllers")

router.post("/getMenuBy", authJwt.protect(), MenuController.getMenuBy)
router.post("/getMenuPermissionBy", authJwt.protect(), MenuController.getMenuPermissionBy)

module.exports = router