
module.exports = (app) => {
  app.use(require('@/utils/req-handler/connect-provider'))
  app.use(require('@/utils/req-handler/res-format'))

  app.get("/", (req, res) => {
    res.json({ message: `Welcome to ${process.env.APP_NAMESPACE}.` });
  });

  app.use(`/auth`, require("./auth.route"))
  app.use(`/bank`, require("./bank.route"))
  app.use(`/book-bank-branch`, require("./book-bank-branch.route"))
  app.use(`/book-bank`, require("./book-bank.route"))
  app.use(`/branch`, require("./branch.route"))
  app.use(`/company`, require("./company.route"))
  app.use(`/invoice-supplier-list`, require("./invoice-supplier-list.route"))
  app.use(`/invoice-supplier`, require("./invoice-supplier.route"))
  app.use(`/license-notify`, require("./license-notify.route"))
  app.use(`/license`, require("./license.route"))
  app.use(`/menu`, require("./menu.route"))
  app.use(`/notify-event`, require('./notify-event.route'))
  app.use(`/notify`, require('./notify.route'))
  app.use(`/onesignal-player`, require('./onesignal-player.route'))
  app.use(`/payment-log`, require("./payment-log.route"))
  app.use(`/payment`, require("./payment.route"))
  app.use(`/permission`, require("./permission.route"))
  app.use(`/product-category`, require("./product-category.route"))
  app.use(`/product-type`, require("./product-type.route"))
  app.use(`/product`, require("./product.route"))
  app.use(`/supplier`, require("./supplier.route"))
  app.use(`/report-invoice`, require("./report-invoice.route"))
  app.use(`/report-payment`, require("./report-payment.route"))
  app.use(`/report-product`, require("./report-product.route"))
  app.use(`/user-branch`, require("./user-branch.route"))
  app.use(`/user`, require("./user.route"))
  app.use(`/sync-data-log`, require("./sync-data-log.route"))
  app.use(`/sync-data`, require("./sync-data.route"))
}