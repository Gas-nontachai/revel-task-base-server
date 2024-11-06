const Task = function (task) { this.task = task.task }

const { BranchModel, CompanyModel } = require("@/models")

Task.generateCompanyID = (connection) => CompanyModel.generateCompanyID(connection)
Task.getCompanyBy = (connection, data) => CompanyModel.getCompanyBy(connection, data)
Task.getCompanyByID = (connection, data) => CompanyModel.getCompanyByID(connection, data)

Task.insertCompany = async (connection, data) => {
  if (!data.company_id) {
    data.company_id = await CompanyModel.generateCompanyID(connection)
  }

  await CompanyModel.insertCompany(connection, data)
}
Task.updateCompanyBy = (connection, data) => CompanyModel.updateCompanyBy(connection, data)
Task.deleteCompanyBy = async (connection, data) => {
  const { company_id } = data

  await BranchModel.deleteBranchBy(connection, { match: { company_id }, })
  await CompanyModel.deleteCompanyBy(connection, { match: { company_id }, })
}

module.exports = Task