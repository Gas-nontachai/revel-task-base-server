const Task = function (task) { this.task = task.task }

const { fileUpload, removeFile } = require("@/utils/file-helper");

const directory = 'users'
const imgs = ['user_img']

const { UserModel, } = require("@/models")

Task.generateUserID = (connection) => UserModel.generateUserID(connection)
Task.getUserBy = (connection, data) => UserModel.getUserBy(connection, data)
Task.getUserByID = (connection, data) => UserModel.getUserByID(connection, data)

Task.insertUser = async (connection, data, files) => {
  const user = JSON.parse(data.user)

  user.user_id = await UserModel.generateUserID(connection)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    user[key] = await fileUpload(files[key], directory)
  }

  await UserModel.insertUser(connection, user)

  return await UserModel.getUserByID(connection, { user_id: user.user_id })
}
Task.updateUserBy = async (connection, data, files) => {
  const user = JSON.parse(data.user)

  const old_user = await UserModel.getUserByID(connection, user)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    if (old_user[key]) await removeFile(old_user[key])

    user[key] = await fileUpload(files[key], directory)
  }

  await UserModel.updateUserBy(connection, user)

  return await UserModel.getUserByID(connection, { user_id: user.user_id })
}
Task.updatePasswordUserBy = async (connection, data) => {
  const { new_password, user_id } = data

  await UserModel.updatePasswordUserBy(connection, {
    user_id: user_id,
    user_password: new_password,
  })
}
Task.deleteUserBy = (connection, data) => UserModel.deleteUserBy(connection, data)

module.exports = Task