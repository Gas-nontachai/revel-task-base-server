const { Mailer, } = require('@/plugins')

module.exports = (queue) => {
  queue.process(async (job, done) => {
    try {
      console.log("Queue send-mail::process =====>");

      const data = JSON.parse(job.data.payload)

      await Mailer.send(data)

      done()
    } catch (err) {
      console.log(err)
      done(err)
    }
  })

  queue.on("completed", (job) => {
    console.log("Queue send-mail::completed <=====")
  })

  queue.on('error', (err) => {
    console.log('Queue send-mail::error <=====', err)
  })
}