const mysql = require('mysql')

const { formatDate } = require("@/utils/date-helper");

function queryPage({ filters = [], pagination = {}, sorter = {} }) {
  const query = { filter: '', having: '', pagination: '', sort: '', }

  for (const key in filters) {
    if (Array.isArray(filters[key])) {
      if (filters[key].length) query.filter += `AND ${key} IN ('${filters[key].join("','")}') `
    } else if (filters[key]) {
      let keyword = `%${filters[key]}%`
      query.filter += `AND LOWER(${key}) LIKE (LOWER(${mysql.escape(keyword)})) `
    }
  }

  if (pagination.page && pagination.size > 0) {
    query.pagination = `LIMIT ${(pagination.page - 1) * pagination.size}, ${pagination.size} `
  }

  if (sorter?.key && sorter?.order) {
    query.sort = `ORDER BY ${sorter.key} ${sorter.order.toUpperCase() === "DESC" ? "DESC" : "ASC"} `
  } else if (Array.isArray(sorter) && sorter.length) {
    const sort_querys = sorter.map(item => `${item.key} ${item.order.toUpperCase() === "DESC" ? "DESC" : "ASC"}`)

    query.sort = `ORDER BY ${sort_querys.join(', ')} `
  }

  return query
}

function querySearch(search, columns = { dates: [], outers: [] }) {
  let searchs = []
  let havings = []

  if (!search?.text) return ''

  for (const column of search?.columns ?? []) {
    if (columns.dates?.includes(column)) {
      let date_parts = search.text.split(/[-/]/);
      search.text = formatDate(`${date_parts[1]}/${date_parts[0]}/${date_parts[2]}`, 'yyyy-MM-dd')
      if (search.text === 'Invalid Date') continue
    }

    if (columns.outers?.includes(column)) {
      havings.push(`${column} LIKE ${mysql.escape('%' + search.text + '%')}`)
    } else {
      searchs.push(`${column} LIKE ${mysql.escape('%' + search.text + '%')}`)
    }
  }

  let stack_sql = ''

  if (searchs.length) stack_sql += `AND (${searchs.join(' OR ')}) `
  if (havings.length) stack_sql += `HAVING (${havings.join(' OR ')}) `

  return stack_sql
}

module.exports = {
  generateQuery: (data, columns = { dates: [], outers: [] }) => {
    const page = queryPage(data)
    const search = querySearch(data.search, columns)

    return {
      filter: page.filter + search,
      pagination: page.pagination,
      sort: page.sort,
    }
  },
}