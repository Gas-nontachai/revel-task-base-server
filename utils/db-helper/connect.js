const mysql = require('mysql')

const pool = mysql.createPool({
  // timezone: '+7:00',
  connectionLimit: 30,
  charset: 'utf8mb4',
  acquireTimeout: 3000,
  multipleStatements: true,
  port: 3306,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

module.exports = () => new Promise((resolve, reject) => {
  pool.getConnection((err, connection) => {
    if (err) return reject(new Error(err.message))

    connection.session = null

    resolve(connection)
  })
})