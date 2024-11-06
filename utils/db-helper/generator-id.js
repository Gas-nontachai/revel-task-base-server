const { v4: uuidv4 } = require('uuid');

module.exports = {
  generateID: (maxIDLength = 50) => {
    const timestamp = new Date().toISOString().replace(/\D/g, '');
    const uuid = uuidv4().replace(/-/g, '');

    const maxTimestampLength = maxIDLength - uuid.length;
    const truncatedTimestamp = timestamp.slice(0, maxTimestampLength).padEnd(maxTimestampLength, '0');

    return truncatedTimestamp + uuid;
  }
}