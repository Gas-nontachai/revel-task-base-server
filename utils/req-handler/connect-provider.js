const getConnect = require('@/utils/db-helper/connect')

function getSession(req) {
  const { _user } = req.decoded

  return { _id: _user.user_id, _user }
}

module.exports = (req, res, next) => {
  req.useConnection = (body, response = true) => getConnect().then(connection => {
    if (req.decoded) connection.session = getSession(req)

    return body(connection).then(result => {
      connection.release()

      return response ? res.success(result) : { data: result }
    }).catch(err => {
      connection.release()

      return response ? res.error(err, err.statusCode) : { err }
    })
  }).catch(err => res.error(err, 503))

  req.useTransaction = (body, response = true) => getConnect().then(connection => {
    if (req.decoded) connection.session = getSession(req)
    connection.beginTransaction()

    return new Promise((resolve, reject) => body(connection).then(result => {
      connection.commit(() => {
        connection.release();

        resolve(response ? res.success(result) : { data: result })
      });
    }).catch(err => {
      connection.rollback(() => {
        connection.release();

        resolve(response ? res.error(err, err.statusCode) : { err })
      })
    }))
  }).catch(err => {
    res.error(err, 503)
  })

  next()
}