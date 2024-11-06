module.exports = {
  secret: process.env.JWT_SECRET,
  jwt_expiration: 86400,
  jwt_refresh_expiration: 172800,
  issuer: 'revelsoft.co.th',
  audience: 'rvs',
};