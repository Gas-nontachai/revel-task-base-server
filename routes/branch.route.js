const router = require('express').Router()

const { authJwt } = require("@/middlewares")

const { BranchController } = require("@/controllers")

const scope = 'branch'

router.post("/generateBranchID", authJwt.protect(), BranchController.generateBranchID)
router.post("/getBranchBy", authJwt.protect(), BranchController.getBranchBy)
router.post("/getBranchByID", authJwt.protect(), BranchController.getBranchByID)

router.post(
  "/insertBranch",
  authJwt.protect(scope, ['add']),
  BranchController.insertBranch
)
router.post(
  "/updateBranchBy",
  authJwt.protect(scope, ['edit']),
  BranchController.updateBranchBy
)
router.post(
  "/deleteBranchBy",
  authJwt.protect(scope, ['delete']),
  BranchController.deleteBranchBy
)

module.exports = router