const { useConnection } = require('@/utils/db-helper')
const { licenseStore, userStore } = require('@/stores')

const {
  BranchModel,
  UserModel,
  UserBranchModel,
} = require('@/models')

const initialUserResource = () => useConnection(async connection => {
  console.log("========= Initial User Resource =========");

  await refreshUserResource(connection)

  console.log("========= End Initial User Resource =========");
})

const refreshUserResource = async (connection, user_ids = []) => {
  if (!user_ids.length) {
    const { docs: users } = await UserModel.getUserBy(connection)

    user_ids = users.map(item => item.user_id)
  }

  const { docs: branchs } = await BranchModel.getBranchBy(connection)
  const { docs: user_branchs } = await UserBranchModel.getUserBranchBy(connection, {
    match: { user_id: { $in: user_ids }, }
  })

  for (const user_id of user_ids) {
    const _user_branchs = user_branchs.filter(val => val.user_id === user_id)
    const branch_ids = _user_branchs.map(item => item.branch_id)
    const _branchs = branchs.filter(val => branch_ids.includes(val.branch_id))

    userStore.setUser(user_id, {
      branch_ids,
      company_ids: Array.from(new Set(_branchs.map(item => item.company_id))),
    })
  }
}

const getUserHasAccessBy = async (connection, data) => {
  const { branch_id, scope, actions = [] } = data

  const licenses = licenseStore.getManyLicense()
  const license_all_ids = []
  const license_ids = []
  for (const license_id in licenses) {
    const { access, license_all_branch } = licenses[license_id]

    if (!access[scope]) continue

    const has_access = !!actions.find(action => access[scope].includes(action))

    if (has_access) {
      license_all_branch ? license_all_ids.push(license_id) : license_ids.push(license_id)
    }
  }

  const { docs: user_branchs } = await UserBranchModel.getUserBranchBy(connection, { match: { branch_id } })
  const { docs: users } = await UserModel.getUserBy(connection, {
    match: {
      $or: [
        { license_id: { $in: license_all_ids }, },
        {
          $and: [
            { license_id: { $in: license_ids }, },
            { user_id: { $in: user_branchs.map(item => item.user_id) }, },
          ]
        },
      ]
    }
  })

  return users
}

const getUserNotifyActive = async (connection, data) => {
  const { branch_id, event_key, event_type } = data

  const licenses = licenseStore.getManyLicense()
  const license_all_ids = []
  const license_ids = []

  for (const license_id in licenses) {
    const {
      license_all_branch,
      event_mail_keys,
      event_notify_keys,
    } = licenses[license_id]

    const event_keys = event_type === 'mail' ? event_mail_keys : event_notify_keys

    if (!event_keys.includes(event_key)) continue

    license_all_branch ? license_all_ids.push(license_id) : license_ids.push(license_id)
  }

  const { docs: user_branchs } = await UserBranchModel.getUserBranchBy(connection, { match: { branch_id } })
  const { docs: users } = await UserModel.getUserBy(connection, {
    match: {
      $or: [
        { license_id: { $in: license_all_ids }, },
        {
          $and: [
            { license_id: { $in: license_ids }, },
            { user_id: { $in: user_branchs.map(item => item.user_id) }, },
          ]
        },
      ]
    }
  })

  return users
}

module.exports = {
  initialUserResource,
  getUserHasAccessBy,
  getUserNotifyActive,
  refreshUserResource,
}