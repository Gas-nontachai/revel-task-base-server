const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateTaskID = (connection) => new Promise((resolve, reject) => {
  let code = `PT67${formatDate(new Date(), 'MMdd')}`;  // ตัวอย่างเช่น "P671111" สำหรับวันที่ 11 พฤศจิกายน
  let digit = 3;

  // SQL query เพื่อดึงค่า task_id ล่าสุดที่มี 7 หลักแรกตรงกันกับ `code`
  let sql = `SELECT CONCAT(${connection.escape(code)}, '-', LPAD(IFNULL(MAX(CAST(SUBSTRING(task_id, ${code.length + 2}, ${digit}) AS UNSIGNED)), 0) + 1, ${digit}, '0')) AS id 
    FROM tb_task
    WHERE task_id LIKE ${connection.escape(`${code}-%`)}`;

  connection.query(sql, function (err, res) {
    if (err) {
      reject(new Error(err.message));
    } else {
      // ดึงค่า task_id ที่ได้จาก SQL query และส่งคืน
      resolve(res[0].id);
    }
  });
});

Task.insertTask = (connection, data = {}) => new Promise((resolve, reject) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const startDate = formatDate(data.task_start_date);
  const endDate = formatDate(data.task_end_date);

  let sql = `INSERT INTO tb_task (
    task_id,
    task_name,
    task_detail,
    task_start_date,
    task_end_date,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.task_id)},
    ${connection.escape(data.task_name)},
    ${connection.escape(data.task_detail)},
    ${connection.escape(startDate)},
    ${connection.escape(endDate)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`;

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) });
});


Task.getTaskByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT *,
              CONCAT(tb_user_req.user_firstname, ' ', tb_user_req.user_lastname) AS user_req, 
              CONCAT(tb_user_res.user_firstname, ' ', tb_user_res.user_lastname) AS user_res
            FROM 
              tb_project_task AS tb
            LEFT JOIN tb_user AS tb_user_req ON tb.project_task_request_by = tb_user_req.user_id
            LEFT JOIN tb_user AS tb_user_res ON tb.project_task_response_by = tb_user_res.user_id
           WHERE tb.project_id = ${connection.escape(data.task_id)}`;

  connection.query(sql, function (err, res) {
    if (err) {
      return reject(new Error(`Database query failed: ${err.message}`));
    }
    if (!res.length) {
      return resolve([]); // สามารถคืนค่าผลลัพธ์เป็น array ว่างถ้าไม่พบข้อมูล
    }
    resolve(res); // ส่งคืนผลลัพธ์ทั้งหมด
  });
});


Task.updateTaskBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_task SET 
    task_name = ${connection.escape(data.task_name)},
    task_detail = ${connection.escape(data.task_detail)},
    task_start_date = ${connection.escape(data.task_start_date)},
    task_end_date = ${connection.escape(data.task_end_date)},
    addby = ${connection.escape(connection.session._id)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE task_id = ${connection.escape(data.task_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteTaskBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `DELETE FROM tb_task WHERE task_id = ${connection.escape(data.task_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})


module.exports = Task