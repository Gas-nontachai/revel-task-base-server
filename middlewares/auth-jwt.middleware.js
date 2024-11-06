const jwt = require("jsonwebtoken")

const config = require("@/configs/auth.config")

const { licenseStore } = require("@/stores")

const bypass_access = false

function getTokenInfo(decoded) {
  if (decoded.user) return { _user: decoded.user }
}

module.exports = {
  protect: (scope, actions = ['view']) => function (req, res, next) {
    const access_token = req.headers['x-access-token']

    if (!access_token) return res.error({ message: "No token provided" }, 401)

    jwt.verify(access_token, config.secret, (err, decoded) => {
      if (err) return res.error({ message: "Invalid token" }, 401)

      req.decoded = getTokenInfo(decoded)

      if (scope && actions.length && req.decoded._user) {
        const role_access = licenseStore.getLicense(req.decoded._user.license_id)

        if (!role_access?.access[scope] || !actions.filter(action => role_access.access[scope].includes(action)).length) {
          if (bypass_access) {
            console.log('req bypass access', new Date())
          } else {
            return res.error({ message: "Unauthorized" }, 403)
          }
        }
      }

      next()
    })
  },
  protectSocket: () => function (socket, next) {
    if (!socket?.handshake?.query?.token) return new Error('Authentication error')

    jwt.verify(socket.handshake.query.token, config.secret, function (err, decoded) {
      if (err) return new Error('Authentication error')

      socket.decoded = getTokenInfo(decoded)

      next();
    });
  },
}