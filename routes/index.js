
module.exports = (app) => {
  app.use(require('@/utils/req-handler/connect-provider'))
  app.use(require('@/utils/req-handler/res-format'))

  app.get("/", (req, res) => {
    res.json({ message: `Welcome to ${process.env.APP_NAMESPACE}.` });
  });

  app.use(`/auth`, require("./auth.route"))
  app.use(`/license-notify`, require("./license-notify.route"))
  app.use(`/license`, require("./license.route"))
  app.use(`/menu`, require("./menu.route"))
  app.use(`/notify-event`, require('./notify-event.route'))
  app.use(`/notify`, require('./notify.route'))
  app.use(`/onesignal-player`, require('./onesignal-player.route'))
  app.use(`/permission`, require("./permission.route"))
  app.use(`/user`, require("./user.route"))
}