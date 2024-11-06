const users = {}

const getUser = (id) => {
  return users[id] || {}
}

const setUser = (id, val) => {
  users[id] = val
}

module.exports = {
  users,
  getUser,
  setUser,
}