const Task = function (task) { this.task = task.task }

const { LicenseModel, LicenseNotifyModel, PermissionModel } = require("@/models")

const { refreshRoleAccess, } = require('@/utils/auth-helper')

Task.generateLicenseID = (connection) => LicenseModel.generateLicenseID(connection)
Task.getLicenseBy = (connection, data) => LicenseModel.getLicenseBy(connection, data)
Task.getLicenseByID = (connection, data) => LicenseModel.getLicenseByID(connection, data)

Task.insertLicense = async (connection, data) => {
  const {
    license,
    license_notifys,
    permissions,
  } = data

  license.license_id = await LicenseModel.generateLicenseID(connection)

  await PermissionModel.insertPermission(connection, { license_id: license.license_id, permissions })
  await LicenseNotifyModel.insertLicenseNotify(connection, { license_id: license.license_id, license_notifys })
  await LicenseModel.insertLicense(connection, license)

  await refreshRoleAccess(connection)
}
Task.updateLicenseBy = async (connection, data) => {
  const {
    license,
    license_notifys,
    permissions,
  } = data

  await PermissionModel.deletePermissionBy(connection, { match: { license_id: license.license_id } })
  await LicenseNotifyModel.deleteLicenseNotifyBy(connection, { match: { license_id: license.license_id } })

  await PermissionModel.insertPermission(connection, { license_id: license.license_id, permissions })
  await LicenseNotifyModel.insertLicenseNotify(connection, { license_id: license.license_id, license_notifys })
  await LicenseModel.updateLicenseBy(connection, license)

  await refreshRoleAccess(connection)
}
Task.deleteLicenseBy = async (connection, data) => {
  const { license_id } = data

  await PermissionModel.deletePermissionBy(connection, { match: { license_id } })
  await LicenseNotifyModel.deleteLicenseNotifyBy(connection, { match: { license_id } })
  await LicenseModel.deleteLicenseBy(connection, { match: { license_id } })

  await refreshRoleAccess(connection)
}

module.exports = Task