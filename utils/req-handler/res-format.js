module.exports = (req, res, next) => {
  res.success = (data = [], statusCode = 200) => {
    res.status(statusCode).send(data)
  }

  res.error = (err, statusCode = 500) => {
    console.log(err)
    res.status(statusCode).send({ message: err.message, })
  }

  next()
}