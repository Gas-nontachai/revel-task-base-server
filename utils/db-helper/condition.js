const mysql = require('mysql')

const logicals = {
  '$and': 'AND',
  '$or': 'OR',
  '$not': 'NOT',
  '$nor': 'OR NOT',
}

function mapToCondition({ match }) {
  const conditions = mapLogical(match)

  const condition = conditions.join(` AND `)

  return conditions.length ? `AND ${condition} ` : ''
}

function mapLogical(data) {
  const conditions = []

  for (const key in data) {
    const value = data[key]
    const logic = logicals[key]

    if (logic && value instanceof Array) {
      const nesteds = []

      value.forEach(val => {
        const sup_logics = mapLogical(val)

        if (sup_logics.length) nesteds.push(...sup_logics)
      })

      if (!nesteds.length) continue

      const nested_condition = nesteds.join(` ${logic} `)

      conditions.push(`(${nested_condition})`)
    } else {
      const { condition, err } = mapCompare(key, value)

      if (!err) conditions.push(condition)
    }
  }

  return conditions
}

function mapCompare(key, value, main) {
  const field = main || key

  const compares = {
    '$gt': (value) => `${field} > ${mysql.escape(value)}`,
    '$gte': (value) => `${field} >= ${mysql.escape(value)}`,
    '$lt': (value) => `${field} < ${mysql.escape(value)}`,
    '$lte': (value) => `${field} <= ${mysql.escape(value)}`,
    '$in': (value) => `${field} IN ('${(value || []).join("','")}')`,
    '$nin': (value) => `${field} NOT IN ('${(value || []).join("','")}')`,
    '$ne': (value) => value === null ? `${field} IS NOT NULL` : `${field} != ${mysql.escape(value)}`,
    '$eq': (value) => value === null ? `${field} IS NULL` : `${field} = ${mysql.escape(value)}`,
  }

  const result = {}

  const compare_stacks = []
  if (value instanceof Object) {
    if (value['$skip']) result.skip = value['$skip']

    for (const compare_key in compares) {
      if (!value[compare_key] && result.skip) continue

      if (compare_key in value) compare_stacks.push(compares[compare_key](value[compare_key]))
    }
  }

  if (!result.skip && !compare_stacks.length && !field.startsWith('$')) {
    compare_stacks.push(compares.$eq(value))
  }

  result.condition = compare_stacks.join(' AND ')
  result.err = !compare_stacks.length

  return result
}

module.exports = {
  mapToCondition,
  mapCompare,
}