const { formatDate } = require("./date-helper");
const { toFloat } = require("./number-helper");

function isChange(old, curr, {
  texts = [],
  booleans = [],
  dates = [],
  datetimes = [],
  numbers = [],
  times = [],
}) {
  for (const key of texts) {
    if (!old[key] || !curr[key]) continue

    const a = old[key]
    const b = curr[key]

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  for (const key of booleans) {
    const a = !!old[key]
    const b = !!curr[key]

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  for (const key of dates) {
    if (!old[key] || !curr[key]) continue

    const a = formatDate(old[key], 'yyyy-MM-dd')
    const b = formatDate(curr[key], 'yyyy-MM-dd')

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  for (const key of datetimes) {
    if (!old[key] || !curr[key]) continue

    const a = formatDate(old[key], 'yyyy-MM-dd HH:mm:ss')
    const b = formatDate(curr[key], 'yyyy-MM-dd HH:mm:ss')

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  for (const key of numbers) {
    if (!old[key] || !curr[key]) continue

    const a = toFloat(old[key])
    const b = toFloat(curr[key])

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  for (const key of times) {
    if (!old[key] || !curr[key]) continue

    const a = old[key].substring(0, 5)
    const b = curr[key].substring(0, 5)

    if (a !== b) {
      console.log(key, a, b)

      return true
    }
  }

  return false
}

module.exports = {
  isChange,
}