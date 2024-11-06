const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

Task.updateJobTypeBy = (connection) => new Promise((resolve, reject) => {
  let sql = `SELECT *
    FROM tb_permission
    ORDER BY menu_group, menu_id
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.getMenuPermissionBy = (connection, data = {}) => new Promise((resolve, reject) => {
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
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task