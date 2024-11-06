const { useConnection } = require('@/utils/db-helper')
const { licenseStore } = require('@/stores')

const {
  LicenseModel,
  LicenseNotifyModel,
  PermissionModel,
} = require('@/models')

const initialRoleAccess = () => useConnection(async connection => {
  console.log("========= Initial Role Access =========");

  await refreshRoleAccess(connection)

  console.log("========= End Initial Role Access =========");
})

const refreshRoleAccess = async (connection) => {
  const { docs: licenses } = await LicenseModel.getLicenseBy(connection)

  for (const license of licenses) {
    const { docs: license_notifys } = await LicenseNotifyModel.getLicenseNotifyBy(connection, { license_id: license.license_id })
    const { docs: permissions } = await PermissionModel.getPermissionBy(connection, { license_id: license.license_id })

    const event_notify_keys = []
    const event_mail_keys = []
    const access = {}

    for (const license_notify of license_notifys) {
      const {
        notify_event_key,
        is_email_active,
        is_notify_active,
      } = license_notify

      if (is_email_active) event_mail_keys.push(notify_event_key)
      if (is_notify_active) event_notify_keys.push(notify_event_key)
    }

    for (const key in permissions) {
      const {
        menu_name_en,
        permission_view,
        permission_add,
        permission_edit,
        permission_approve,
        permission_cancel,
        permission_delete,
      } = permissions[key]

      if (menu_name_en && permission_view) {
        access[menu_name_en] = ['view']

        permission_add && access[menu_name_en].push('add')
        permission_edit && access[menu_name_en].push('edit')
        permission_approve && access[menu_name_en].push('approve')
        permission_cancel && access[menu_name_en].push('cancel')
        permission_delete && access[menu_name_en].push('delete')
      }
    }

    licenseStore.setLicense(license.license_id, {
      ...license,
      access,
      event_notify_keys,
      event_mail_keys,
    })
  }
}

module.exports = {
  initialRoleAccess,
  refreshRoleAccess,
}