const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { PermissionController } = require("@/controllers");

router.post("/getPermissionBy", authJwt.protect(), PermissionController.getPermissionBy)

module.exports = router