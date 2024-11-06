const Task = function (task) { this.task = task.task }

const { OnesignalPlayerModel, } = require('@/models')

Task.updateOnesignalPlayerBy = (req) => req.useConnection((connection) => OnesignalPlayerModel.updateOnesignalPlayerBy(connection, req.body))

module.exports = Task