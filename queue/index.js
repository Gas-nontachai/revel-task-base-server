const Bull = require('bull')

const option = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_KEY,
  },
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
}

const queue = {}

const registerWorker = () => {
  const worker = {
    'send-mail': require('./send-mail.worker'),
    'sync-data': require('./sync-data.worker'),
  }

  for (const key in worker) {
    queue[key] = new Bull(`${process.env.REDIS_NAMESPACE}:${key}`, option)

    worker[key](queue[key])
  }
}

module.exports = {
  queue,
  registerWorker,
}