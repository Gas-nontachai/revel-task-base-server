require('module-alias/register')

const express = require('express')
const path = require('path')
const socket = require('socket.io')

const { formatDate } = require("@/utils/date-helper")

const app = express()

if (process.env.NODE_ENV) {
  require('dotenv').config({ path: `.${process.env.NODE_ENV}.env` })
} else {
  require('dotenv').config()
}

const publicDir = path.join(__dirname, '/public/')

app.use(express.static(publicDir))
app.use(express.json({ limit: '5120mb', extended: true }))
app.use(express.urlencoded({ limit: '5120mb', extended: true }))

app.use((req, res, next) => {
  const origin = req.get('origin')

  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma')
  res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma')

  req.timestamp = new Date()

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
  } else {
    console.log(`${req.method} ${req.originalUrl} [${formatDate(req.timestamp, 'dd/MM/yyyy HH:mm:fff')}]`)

    next()
  }
})

const server = app.listen(process.env.APP_PORT, () => {
  console.log(`Server running on port ${process.env.APP_PORT}.`)
  console.log(`Environment : ${process.env.NODE_ENV || ''}.env`)
})

global.io = socket(server, {
  cors: {
    origin: "*",
    // allowedHeaders: ["my-custom-header"],
    // credentials: true
  },
  maxHttpBufferSize: 20e6 // Mb
});

const {
  initialRoleAccess,
  initialUserResource,
} = require('@/utils/auth-helper')

initialRoleAccess()
initialUserResource()

// require('@/cron-job')
// require('@/queue').registerWorker()
require('@/socket/notify')(io)
require('@/routes')(app)