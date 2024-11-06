const { authJwt, } = require("@/middlewares");

module.exports = (io) => {
  io.use(authJwt.protectSocket()).on('connection', (socket) => {
    const { _user, } = socket.decoded

    if (_user) socket.join('user');

    socket.on('disconnecting', async () => {
      if (_user) socket.leave('user');
    })
  })
}