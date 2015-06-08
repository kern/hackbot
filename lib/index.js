var Group = require('./Group')
var app = require('./app')
var db = require('./db')

var DEFAULT_PORT = 3000

// TODO: Make filters use hooks instead of a single function.

var FILTERS = [
  require('./filters/closed'),
  require('./filters/quiet'),
  require('./filters/sentiment')
]

var processor = new ThreadProcessor(FILTERS)
var watcher = null
db.on('value', function (snapshot) {
  var group = new Group(snapshot.val())

  if (watcher) watcher.stop()
  watcher = new GroupWatcher(group, function (thread) {
    return processor.process(group, thread)
  })
})

app.start(process.env.PORT || DEFAULT_PORT)
