const Task = function (task) { this.task = task.task }

const { BranchModel, UserBranchModel } = require("@/models")

const { refreshUserResource, } = require('@/utils/auth-helper')

Task.generateBranchID = (connection) => BranchModel.generateBranchID(connection)
Task.getBranchBy = (connection, data) => BranchModel.getBranchBy(connection, data)
Task.getBranchByID = (connection, data) => BranchModel.getBranchByID(connection, data)

Task.insertBranch = async (connection, data) => {
  const { branch, user_branchs } = data

  if (!branch.branch_id) {
    branch.branch_id = await BranchModel.generateBranchID(connection)
  }

  await BranchModel.insertBranch(connection, branch)
  await UserBranchModel.insertUserBranch(connection, { branch_id: branch.branch_id, user_branchs })

  await refreshUserResource(connection, user_branchs.map(item => item.user_id))
}
Task.updateBranchBy = async (connection, data) => {
  const { branch, user_branchs } = data

  await UserBranchModel.deleteUserBranchBy(connection, { match: { branch_id: branch.branch_id } })

  await BranchModel.updateBranchBy(connection, branch)
  await UserBranchModel.insertUserBranch(connection, { branch_id: branch.branch_id, user_branchs })

  await refreshUserResource(connection)
}
Task.deleteBranchBy = async (connection, data) => {
  const { branch_id } = data

  await BranchModel.deleteBranchBy(connection, { match: { branch_id } })
  await UserBranchModel.deleteUserBranchBy(connection, { match: { branch_id } })

  await refreshUserResource(connection)
}

module.exports = Task