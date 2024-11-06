const getConnect = require('@/utils/db-helper/connect')

module.exports = {
  useConnection: (body) => getConnect().then(connection => {
    return body(connection).then(result => {
      connection.release()

      return { data: result }
    }).catch(err => {
      connection.release()

      console.log(err)
      return { err }
    })
  }).catch(err => {
    console.log(err)

    return { err }
  }),
  useTransaction: (body) => getConnect().then(connection => {
    connection.beginTransaction()

    return body(connection).then(result => {
      connection.commit(() => {
        connection.release();
      })

      return { data: result }
    }).catch(err => {
      connection.rollback(() => {
        connection.release();
      })

      console.log(err)
      return { err }
    })
  }).catch(err => {
    console.log(err)

    return { err }
  }),
}