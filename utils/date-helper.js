const moment = require('moment')
const padZero = (value, pad = 2) => value.toString().padStart(pad, '0');

module.exports = {
  formatDate: (value, format = 'dd/MM/yyyy') => {
    const date = new Date(value)

    const formatTokens = {
      'yyyy': () => date.getFullYear().toString(),
      'MM': () => padZero(date.getMonth() + 1),
      'dd': () => padZero(date.getDate()),
      'HH': () => padZero(date.getHours()),
      'mm': () => padZero(date.getMinutes()),
      'ss': () => padZero(date.getSeconds()),
      'fff': () => padZero(date.getMilliseconds(), 3),
    };

    let formattedDate = format;

    for (const key in formatTokens) {
      if (format.includes(key)) {
        formattedDate = formattedDate.replace(key, formatTokens[key]())
      }
    }

    return formattedDate;
  },
  calcEndDate: (value, number) => {
    const start_date = new Date(value)

    const YY = start_date.getFullYear(), MM = start_date.getMonth(), DD = start_date.getDate()

    return new Date(YY, MM, DD + ~~+number)
  },
  previousDate: (value, number) => {
    const date = new Date(value)

    date.setDate(date.getDate() - number);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const previousDate = `${year}-${month}-${day}`;

    return previousDate;
  },
  diffDate: (start, end) => moment.duration(moment(end).diff(moment(start))).asDays(),
  diffMinute: (start, end) => moment.duration(moment(end).diff(moment(start))).asMinutes(),
  timeToMinute: (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}