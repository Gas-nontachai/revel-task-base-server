const axios = require('axios');

const createClient = () => {
  const httpClient = axios.create({
    baseURL: 'https://onesignal.com/',
    headers: {
      'Accept': 'application/json',
      "Content-Type": "application/json; charset=utf-8",
    },
    timeout: 60000
  });

  return httpClient
}

module.exports = createClient;