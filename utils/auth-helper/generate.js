const jwt = require("jsonwebtoken")

const config = require("@/configs/auth.config")

module.exports = {
  generateAuthJWT: (user) => ({
    access_token: jwt.sign({ user, }, config.secret, {
      expiresIn: config.jwt_expiration,
      issuer: config.issuer,
      audience: config.audience,
    }),
    refresh_token: jwt.sign({ user_id: user.user_id, }, config.secret, {
      expiresIn: config.jwt_refresh_expiration,
      issuer: config.issuer,
      audience: config.audience,
    }),
  })
}