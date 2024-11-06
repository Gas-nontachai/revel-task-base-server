const Task = function (task) { this.task = task.task }

const nodemailer = require("nodemailer")

const { queue } = require("@/queue")

const event_cases = {
  ...require("./payment"),
  ...require("./sync-data"),
};

Task.createMail = async (connection, event_type, data) => {
  const caseAction = event_cases[event_type.toLowerCase()]

  if (!caseAction) return console.log(`email[${event_type}] not found`)

  const email_case = await caseAction(connection, data)

  if (!email_case) return

  const { mails, emails, } = email_case

  if (!mails.length || !emails.length) return

  for (const mail of mails) {
    queue['send-mail'].add({
      adddate: new Date(),
      payload: JSON.stringify({ mail, emails, }),
    }, { lifo: true })
  }

  console.log(`queue mail:[${mails.length}] recipient[${emails.length}]`);
}

Task.send = ({ mail, emails }) => new Promise((resolve, reject) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  mail.from = process.env.SMTP_USER
  mail.to = emails.join(',')

  transporter.sendMail(mail, (err, info) => {
    if (err) return reject(err)

    resolve(info)
  })
})

module.exports = Task