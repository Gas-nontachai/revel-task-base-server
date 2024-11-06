const Task = function (task) {
	this.task = task.task
	this.created_at = new Date()
}

const { formatDate } = require('@/utils/date-helper')
const { generateQuery, mapToCondition } = require("@/utils/db-helper")

Task.generateProductTypeID = (connection) => new Promise((resolve, reject) => {
	let code = `PT${formatDate(new Date(), 'yyyy')}`
	let digit = 3

	let sql = `SELECT CONCAT(${connection.escape(code)}, LPAD(IFNULL(MAX(CAST(SUBSTRING(product_type_id,${(code.length + 1)},${digit}) AS SIGNED)),0) + 1,${digit},0)) AS id 
		FROM tb_product_type
		WHERE product_type_id LIKE (${connection.escape(`${code}%`)}) 
	`
	connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res[0].id) })
})

Task.getProductTypeBy = (connection, data = {}) => new Promise((resolve, reject) => {
	let condition = mapToCondition(data)

	const { filter, pagination, sort } = generateQuery(data)

	const core_query = `SELECT tb.*
		FROM tb_product_type AS tb
		WHERE TRUE
		${filter}
		${condition}
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

Task.getProductTypeByID = (connection, data = {}) => new Promise((resolve, reject) => {
	let sql = `SELECT *
		FROM tb_product_type
		WHERE product_type_id = ${connection.escape(data.product_type_id)}`

	connection.query(sql, function (err, res) {
		if (err) {
			reject(new Error(err.message))
		} else if (!res.length) {
			data.required === false ? resolve() : reject(new Error('Not Found'))
		} else {
			resolve(res[0])
		}
	})
})

Task.insertProductType = (connection, data = {}) => new Promise((resolve, reject) => {
	let sql = `INSERT INTO tb_product_type (
		product_type_id,
		product_type_name,
		product_type_detail,
		addby,
		adddate
	) VALUES (
		${connection.escape(data.product_type_id)},
		${connection.escape(data.product_type_name)},
		${connection.escape(data.product_type_detail)},
		${connection.escape(connection.session._id)},
		NOW()
	)`

	connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.updateProductTypeBy = (connection, data = {}) => new Promise((resolve, reject) => {
	let sql = `UPDATE tb_product_type SET 
		product_type_name = ${connection.escape(data.product_type_name)},
		product_type_detail = ${connection.escape(data.product_type_detail)},
		updateby = ${connection.escape(connection.session._id)},
		lastupdate = NOW()
		WHERE product_type_id = ${connection.escape(data.product_type_id)}`

	connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

Task.deleteProductTypeBy = (connection, data = {}) => new Promise((resolve, reject) => {
	let sql = `DELETE 
		FROM tb_product_type 
		WHERE product_type_id = ${connection.escape(data.product_type_id)}
	`
	connection.query(sql, function (err, res) { err ? reject(new Error(err.message)) : resolve(res) })
})

module.exports = Task;