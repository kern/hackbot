var Group = require('./Group')
var app = require('./app')
var db = require('./db')
var feed = require('./feed')
var log = require('./log')
var refresher = require('./refresher')

var defaultPort = 3000
var refreshRate = 5000

var filters = [
  require('./filters/closed'),
  require('./filters/quiet')
]

var group = null
db.on('value', function (snapshot) {
  group = new Group(snapshot.val())
})

log.info({ rate: refreshRate }, 'started refreshing')
refresher(refreshRate, function () {
  if (!group) return Promise.resolve()

  log.info({ group: group.id }, 'refreshing')
  return feed.refresh(group, filters)
    .catch(function (err) {
      log.error(err, 'error while refreshing')
    })
})

app.start(process.env.PORT || defaultPort)
