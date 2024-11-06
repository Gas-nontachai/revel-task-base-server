const calcPercent = (a, b) => a && b ? (a / b) * 100 : 0

const toInt = (number) => number ? ~~+number.toString().replace(/,/g, '') : 0
const toFloat = (number) => number ? +number.toString().replace(/,/g, '') : 0

const decimalFix = (number, decimal = 2, nzero = true) => {
  number = toFloat(number)

  return !nzero && number === 0 ? '' : number.toFixed(decimal).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
}

module.exports = {
  calcPercent,
  decimalFix,
  formatFileSize,
  toInt,
  toFloat,
}