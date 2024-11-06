const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { mapToCondition } = require('@/utils/db-helper')

Task.getPermissionBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT tb.menu_id,
    menu_group,
    menu_name_th,
    menu_name_en,
    IFNULL(permission_view, FALSE) AS permission_view,
    IFNULL(permission_add, FALSE) AS permission_add,
    IFNULL(permission_edit, FALSE) AS permission_edit,
    IFNULL(permission_approve, FALSE) AS permission_approve,
    IFNULL(permission_cancel, FALSE) AS permission_cancel,
    IFNULL(permission_delete, FALSE) AS permission_delete,
    IFNULL(permission_print, FALSE) AS permission_print
    FROM tb_menu AS tb
    LEFT JOIN tb_permission ON tb.menu_id = tb_permission.menu_id AND license_id = ${connection.escape(data.license_id || '')}
    ORDER BY menu_group, tb.menu_id
    `
  connection.query(sql, function (err, res) {
    err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res.length })
  })
})

Task.insertPermission = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = ''

  data.permissions.forEach((item, idx) => {
    sql += `INSERT INTO tb_permission (
      license_id,
      menu_id,
      permission_view,
      permission_add,
      permission_edit,
      permission_approve,
      permission_cancel,
      permission_delete,
      permission_print
    ) VALUES (
      ${connection.escape(data.license_id)},
      ${connection.escape(item.menu_id)},
      ${connection.escape(item.permission_view)},
      ${connection.escape(item.permission_add)},
      ${connection.escape(item.permission_edit)},
      ${connection.escape(item.permission_approve)},
      ${connection.escape(item.permission_cancel)},
      ${connection.escape(item.permission_delete)},
      ${connection.escape(item.permission_print)}
    );`
  })

  if (!sql) return resolve([])

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deletePermissionBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  if (!condition) return reject(new Error('Delete must have condition'))

  let sql = `DELETE FROM tb_permission WHERE TRUE ${condition} `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;