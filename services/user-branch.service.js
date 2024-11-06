const Task = function (task) { this.task = task.task }

const {
  UserBranchModel,
  UserModel,
} = require("@/models")

Task.getUserBranchBy = async (connection, data) => {
  const { options = [] } = data

  const user_branchs = await UserBranchModel.getUserBranchBy(connection, data)

  if (options.length) {
    for (const user_branch of user_branchs.docs) {
      if (options.includes('user')) {
        user_branch.user = await UserModel.getUserBy(connection, {
          match: { user_id: user_branch.user_id, }
        }).then(res => res.docs[0])
      }
    }
  }

  return user_branchs
}

module.exports = Task