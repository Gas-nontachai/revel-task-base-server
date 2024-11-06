const fileupload = require('express-fileupload')
const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { UserController } = require("@/controllers");

const scope = 'user'

router.post(
  "/generateUserID",
  authJwt.protect(),
  UserController.generateUserID
)
router.post(
  "/getUserBy",
  authJwt.protect(),
  UserController.getUserBy
)
router.post(
  "/getUserByID",
  authJwt.protect(),
  UserController.getUserByID
)

router.post(
  "/updateUserBy",
  authJwt.protect(scope, ['edit']),
  fileupload({ createParentPath: true, }),
  UserController.updateUserBy
)
router.post(
  "/insertUser",
  authJwt.protect(scope, ['add']),
  fileupload({ createParentPath: true, }),
  UserController.insertUser
)
router.post(
  "/updatePasswordUserBy",
  authJwt.protect(scope, ['approve']),
  UserController.updatePasswordUserBy
)
router.post(
  "/deleteUserBy",
  authJwt.protect(scope, ['delete']),
  UserController.deleteUserBy
)

module.exports = router