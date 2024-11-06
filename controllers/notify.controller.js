const Task = function (task) { this.task = task.task }

const { NotifyModel, NotifyRecipientModel } = require('@/models')
const { NotifyService, } = require('@/services')

Task.getMyNoti = (req) => req.useConnection((connection) => NotifyService.getMyNoti(connection))
Task.getNotifyBy = (req) => req.useConnection((connection) => NotifyModel.getNotifyBy(connection, req.body))
Task.getInitNotify = (req) => req.useConnection((connection) => NotifyService.getInitNotify(connection, req.body))

Task.seenNotifyBy = (req) => req.useConnection((connection) => NotifyRecipientModel.updateNotifyRecipientBy(connection, req.body))
Task.deleteNotifyBy = (req) => req.useConnection((connection) => NotifyRecipientModel.deleteNotifyRecipientBy(connection, req.body))

module.exports = Task