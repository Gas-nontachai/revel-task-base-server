const Task = function (task) { this.task = task.task }

const { fileUpload, removeFile } = require("@/utils/file-helper");

const directory = 'tasks'
const imgs = ['task_img']

const { TaskModel } = require("@/models")

Task.generateTaskID = (connection) => TaskModel.generateTaskID(connection)
Task.getTaskBy = (connection, data) => TaskModel.getTaskBy(connection, data)
Task.getTaskByID = (connection, data) => TaskModel.getTaskByID(connection, data)

Task.insertTask = async (connection, data, files) => {
  const task = JSON.parse(data.task)

  task.task_id = await TaskModel.generateTaskID(connection)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    task[key] = await fileUpload(files[key], directory)
  }

  await TaskModel.insertTask(connection, task)

  return await TaskModel.getTaskByID(connection, { task_id: task.task_id })
}
Task.updateTaskBy = async (connection, data, files) => {
  const task = JSON.parse(data.task)

  const old_task = await TaskModel.getTaskByID(connection, task)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    if (old_task[key]) await removeFile(old_task[key])

    task[key] = await fileUpload(files[key], directory)
  }

  await TaskModel.updateTaskBy(connection, task)

  return await TaskModel.getTaskByID(connection, { task_id: task.task_id })
}
Task.deleteTaskBy = (connection, data) => TaskModel.deleteTaskBy(connection, data)

module.exports = Task