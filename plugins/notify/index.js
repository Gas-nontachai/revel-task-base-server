const Task = function (task) { this.task = task.task }

const onesignal = require("./api/onesignal");

const event_cases = {
  ...require("./payment"),
  ...require("./sync-data"),
};

const {
  NotifyRecipientModel,
  NotifyModel,
  OnesignalPlayerModel,
} = require('@/models')

Task.send = async (connection, event_type, data) => {
  const caseAction = event_cases[event_type.toLowerCase()]

  if (!caseAction) return console.log(`notify[${event_type}] not found`)

  const notify_case = await caseAction(connection, data)

  if (!notify_case) return

  const { notifys, target, } = notify_case

  const { user_ids = [], } = target

  if (!notifys?.length || !user_ids?.length) return

  const { docs: recipients } = await OnesignalPlayerModel.getOnesignalPlayerBy(connection, {
    match: {
      $or: [{ user_id: { $in: user_ids } }],
    }
  })

  const player_ids = recipients.map(val => val.player_id)

  for (const notify of notifys) {
    const { data: notify_id } = await NotifyModel.insertNotify(connection, notify)

    for (const user_id of user_ids) {
      await NotifyRecipientModel.insertNotifyRecipient(connection, { notify_id, user_id, })
    }

    if (player_ids.length) onesignal.userNotifications({
      message: notify.notify_title,
      player_ids,
      url: notify.notify_url,
    })
  }

  io.to('user').emit('has-noti', user_ids)

  console.log(`notify:send[${notifys.length}] recipient[${user_ids.length}]`);
}

module.exports = Task