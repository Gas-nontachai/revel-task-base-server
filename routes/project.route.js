const fileupload = require('express-fileupload')
const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { ProjectController } = require("@/controllers");

const scope = 'project'

router.post(
  "/generateProjectID",
  authJwt.protect(),
  ProjectController.generateProjectID
)
router.post(
  "/getProjectBy",
  authJwt.protect(),
  ProjectController.getProjectBy
)
router.post(
  "/getProjectByID",
  authJwt.protect(),
  ProjectController.getProjectByID
)
router.post(
  "/updateProjectBy",
  authJwt.protect(scope, ['edit']),
  fileupload({ createParentPath: true, }),
  ProjectController.updateProjectBy
)
router.post(
  "/insertProject",
  authJwt.protect(scope, ['add']),
  fileupload({ createParentPath: true, }),
  ProjectController.insertProject
)
router.post(
  "/deleteProjectBy",
  authJwt.protect(scope, ['delete']),
  ProjectController.deleteProjectBy
)

module.exports = router