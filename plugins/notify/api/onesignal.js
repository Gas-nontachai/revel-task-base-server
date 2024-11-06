const httpClient = require('./http-client')()

const userNotifications = async (data) => {
  const result = await httpClient.post(`/api/v1/notifications`, JSON.stringify({
    app_id: process.env.ONE_SIGNAL_APP_ID,
    contents: { "en": data.message },
    include_player_ids: data.player_ids,
    url: data.url,
  }), {
    headers: {
      "Authorization": `Basic ${process.env.ONE_SIGNAL_API_KEY}`,
    },
  }).then((e) => e).catch((err) => {
    console.log(err)
  });

  return result
}

module.exports = {
  userNotifications,
}