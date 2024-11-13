const Task = function (task) {
  this.task = task.task
  this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateProjectID = (connection) => new Promise((resolve, reject) => {
  let code = `P67${formatDate(new Date(), 'MMdd')}`;  // ตัวอย่างเช่น "P671111" สำหรับวันที่ 11 พฤศจิกายน
  let digit = 3;

  // SQL query เพื่อดึงค่า project_id ล่าสุดที่มี 7 หลักแรกตรงกันกับ `code`
  let sql = `SELECT CONCAT(${connection.escape(code)}, '-', LPAD(IFNULL(MAX(CAST(SUBSTRING(project_id, ${code.length + 2}, ${digit}) AS UNSIGNED)), 0) + 1, ${digit}, '0')) AS id 
    FROM tb_project
    WHERE project_id LIKE ${connection.escape(`${code}-%`)}`;

  connection.query(sql, function (err, res) {
    if (err) {
      reject(new Error(err.message));
    } else {
      // ดึงค่า project_id ที่ได้จาก SQL query และส่งคืน
      resolve(res[0].id);
    }
  });
});


Task.getProjectBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let condition = mapToCondition(data)

  const { filter, pagination, sort } = generateQuery(data)

  const core_query = `SELECT 
    project_id, 
    project_name, 
    project_detail, 
    DATE_FORMAT(project_start_date, '%Y-%m-%d') AS project_start_date, 
    DATE_FORMAT(project_end_date, '%Y-%m-%d') AS project_end_date
FROM 
    tb_project AS tb
    WHERE TRUE
    ${condition}
    ${filter}
  `
  const count_query = `SELECT COUNT(*) AS total FROM (${core_query}) AS tb`

  if (data.count) return connection.query(count_query, function (err, res_total) {
    err ? reject(new Error(err.message)) : resolve(res_total[0].total)
  })

  connection.query(`${core_query} ${sort} ${pagination}`, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!pagination) return resolve({ docs: res, totalDocs: res.length })

    connection.query(count_query, function (err, res_total) {
      err ? reject(new Error(err.message)) : resolve({ docs: res, totalDocs: res_total[0].total })
    })
  })
})

Task.getProjectByID = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `SELECT 
    project_id, 
    project_name, 
    project_detail, 
    DATE_FORMAT(project_start_date, '%Y-%m-%d') AS project_start_date, 
    DATE_FORMAT(project_end_date, '%Y-%m-%d') AS project_end_date
FROM 
    tb_project AS tb
    WHERE project_id = ${connection.escape(data.project_id)}
    `
  connection.query(sql, function (err, res) {
    if (err) return reject(new Error(err.message))
    if (!res.length) return data.required === false ? resolve() : reject(new Error('Not Found'))

    resolve(res[0])
  })
})


Task.insertProject = (connection, data = {}) => new Promise((resolve, reject) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const startDate = formatDate(data.project_start_date);
  const endDate = formatDate(data.project_end_date);

  let sql = `INSERT INTO tb_project (
    project_id,
    project_name,
    project_detail,
    project_start_date,
    project_end_date,
    addby,
    adddate
  ) VALUES (
    ${connection.escape(data.project_id)},
    ${connection.escape(data.project_name)},
    ${connection.escape(data.project_detail)},
    ${connection.escape(startDate)},
    ${connection.escape(endDate)},
    ${connection.escape(connection.session._id)},
    NOW()
  )`;

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) });
});


Task.updateProjectBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `UPDATE tb_project SET 
    project_name = ${connection.escape(data.project_name)},
    project_detail = ${connection.escape(data.project_detail)},
    project_start_date = ${connection.escape(data.project_start_date)},
    project_end_date = ${connection.escape(data.project_end_date)},
    addby = ${connection.escape(connection.session._id)},
    updateby = ${connection.escape(connection.session._id)},
    lastupdate = NOW()
    WHERE project_id = ${connection.escape(data.project_id)}
  `
  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteProjectBy = (connection, data = {}) => new Promise((resolve, reject) => {
  let sql = `DELETE FROM tb_project WHERE project_id = ${connection.escape(data.project_id)} `

  connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})
module.exports = Task