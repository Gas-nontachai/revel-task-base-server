const Task = function (task) { this.task = task.task }

const { useConnection } = require('@/utils/db-helper')

const { OnesignalPlayerModel } = require('@/models');

Task.deleteInactivePlayer = () => useConnection(async connection => {
  await OnesignalPlayerModel.deleteInactivePlayer(connection)
})

module.exports = Task