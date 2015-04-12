var express = require('express')
var log = require('./log')

var app = express()

app.get('/', function (req, res) {
  res.send('Hello from Hackathon Hackbot! <3')
})

exports.start = function (port) {
  return app.listen(port, function (err) {
    if (err) return log.error(err, 'error starting app')
    log.info({ port: port }, 'started app')
  })
}
