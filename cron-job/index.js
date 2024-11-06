const cron = require('node-cron');

const NotifyJob = require("./notify");
const OnesignalJob = require("./onesignal");
const SyncDataLogJob = require("./sync-data-log");

cron.schedule('00 00 01 * * *', async () => {
  try {
    console.log('cron [00 00 01 * * *]:process =====>')

    await NotifyJob.deleteExpired()
    await OnesignalJob.deleteInactivePlayer()
    await SyncDataLogJob.deleteExpired()

    console.log('cron [00 00 01 * * *]:end <=====')
  } catch (err) {
    console.log(err)
  }
});