const { useTransaction } = require('@/utils/db-helper')
const { formatDate } = require("@/utils/date-helper")

const { SyncDataModel, } = require('@/models')
const {
  SyncDataService,
  SyncDataLogService,
} = require('@/services')

module.exports = (queue) => {
  queue.process(async (job, done) => {
    try {
      console.log(`Queue sync-data::process =====> [`, formatDate(new Date(), 'dd/MM/yyyy HH:mm:fff'), `]`);

      const { adddate, payload } = job.data

      const data = JSON.parse(payload)

      console.log(`sync-data:branch[${data.branch_id}] adddate[`, formatDate(adddate, 'dd/MM/yyyy HH:mm:fff'), `]`)

      const { err, } = await useTransaction(connection => SyncDataService.syncData(connection, data))

      await useTransaction(async connection => {
        const sync_data_status = err ? 'fail' : 'success'

        await SyncDataModel.updateSyncDataStatusBy(connection, {
          sync_data_id: data.sync_data_id,
          sync_data_status,
        })

        await SyncDataLogService.insertSyncDataLog(connection, {
          sync_data_id: data.sync_data_id,
          current_sync_time: data.current_sync_time,
          last_sync_time: data.last_sync_time,
          sync_data_result: sync_data_status,
          sync_data_error: err ? err.message : '',
        })
      })

      done()
    } catch (err) {
      console.log(err)
      done(err)
    }
  })

  queue.on("completed", (job) => {
    console.log("Queue sync-data::completed <===== [", formatDate(new Date(), 'dd/MM/yyyy HH:mm:fff'), `]`);
  })

  queue.on('error', (err) => {
    console.log('Queue sync-data::error <=====', err)
  })
}