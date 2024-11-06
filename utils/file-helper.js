const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid');

const MB = 20
const FILE_SIZE_LIMIT = MB * 1024 * 1024
const FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.mp3', ".mp4", ".webm", ".ogg", '.pdf', '.txt', '.xls', '.xlsx', '.docx']

const createDirectory = (directory) => {
  directory = path.join(__dirname, '../public/', directory)

  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true })

  return directory
}

const fileUpload = (file, dir = 'file') => new Promise((resolve, reject) => {
  const { err: errValidate } = validateFile(file)

  if (errValidate) reject(errValidate)

  const name = `${uuidv4()}-ign-${file.name}`
  file.mv(`${createDirectory(dir)}/${name}`, (err) => {
    err ? reject(new Error(err.message)) : resolve(`/${dir}/${name}`)
  })
})

function saveBase64Img({ file, old = '', directory = 'image', }) {
  if (!file?.src || !file?.name) return old
  if (old) removeFile(old)

  const name = `${uuidv4()}-ign-${file.name}`
  fs.writeFileSync(`${createDirectory(directory)}/${name}`, file.src.replace(/^data:([A-Za-z-+/]+);base64,/, ''), { encoding: 'base64' })

  return `/${directory}/${name}`
}

const validateFile = (file) => {
  if (!file) return { err: { message: 'Missing file.' } }
  if (file.size > FILE_SIZE_LIMIT) return { err: { message: `File size over the linit of ${MB} MB.` } }
  if (!FILE_EXTENSIONS.includes(path.extname(file.name).toLowerCase())) return { err: { message: `File type not allowed.` } }

  return { isvalid: true }
}

const removeDirectory = (directory) => new Promise((resolve, reject) => {
  directory = path.join(__dirname, '../public/', directory.toString())

  if (fs.existsSync(directory)) fs.rmdir(directory, (err) => {
    err ? reject(new Error(err.message)) : resolve(true)
  })
})

const removeFile = (data) => new Promise((resolve, reject) => {
  fs.unlink(path.join(__dirname, `../public/${data}`), (err) => {
    err ? resolve(err) : resolve(true)
  })
})

module.exports = {
  createDirectory,
  fileUpload,
  removeFile,
  removeDirectory,
  saveBase64Img,
  validateFile,
}