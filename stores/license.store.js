const licenses = {}

const getLicense = (id) => {
  return licenses[id] || {}
}

const getManyLicense = () => {
  return licenses
}

const setLicense = (id, val) => {
  licenses[id] = val
}

module.exports = {
  licenses,
  getLicense,
  getManyLicense,
  setLicense,
}