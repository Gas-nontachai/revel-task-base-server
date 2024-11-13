const fileupload = require('express-fileupload')
const router = require('express').Router()

const { authJwt } = require("@/middlewares");

const { TaskController } = require("@/controllers");

const scope = 'task'

router.post(
  "/generateTaskID",
  authJwt.protect(),
  TaskController.generateTaskID
)
router.post(
  "/getTaskByID",
  authJwt.protect(),
  TaskController.getTaskByID
)
router.post(
  "/updateTaskBy",
  authJwt.protect(scope, ['edit']),
  fileupload({ createParentPath: true, }),
  TaskController.updateTaskBy
)
router.post(
  "/insertTask",
  authJwt.protect(scope, ['add']),
  fileupload({ createParentPath: true, }),
  TaskController.insertTask
)
router.post(
  "/deleteTaskBy",
  authJwt.protect(scope, ['delete']),
  TaskController.deleteTaskBy
)

module.exports = router