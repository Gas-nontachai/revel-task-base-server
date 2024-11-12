const Task = function (task) { this.task = task.task }

const { fileUpload, removeFile } = require("@/utils/file-helper");

const directory = 'projects'
const imgs = ['project_img']

const { ProjectModel } = require("@/models")

Task.generateProjectID = (connection) => ProjectModel.generateProjectID(connection)
Task.getProjectBy = (connection, data) => ProjectModel.getProjectBy(connection, data)
Task.getProjectByID = (connection, data) => ProjectModel.getProjectByID(connection, data)
Task.getProjectTaskByID = (connection, data) => ProjectModel.getProjectTaskByID(connection, data)

Task.insertProject = async (connection, data, files) => {
  const project = JSON.parse(data.project)

  project.project_id = await ProjectModel.generateProjectID(connection)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    project[key] = await fileUpload(files[key], directory)
  }

  await ProjectModel.insertProject(connection, project)

  return await ProjectModel.getProjectByID(connection, { project_id: project.project_id })
}
Task.updateProjectBy = async (connection, data, files) => {
  const project = JSON.parse(data.project)

  const old_project = await ProjectModel.getProjectByID(connection, project)

  for (const key in files ?? []) {
    if (!imgs.includes(key)) continue
    if (old_project[key]) await removeFile(old_project[key])

    project[key] = await fileUpload(files[key], directory)
  }

  await ProjectModel.updateProjectBy(connection, project)

  return await ProjectModel.getProjectByID(connection, { project_id: project.project_id })
}
Task.deleteProjectBy = (connection, data) => ProjectModel.deleteProjectBy(connection, data)

module.exports = Task