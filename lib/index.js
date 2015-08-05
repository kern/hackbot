var Group = require('./Group')
var GroupWatcher = require('./GroupWatcher')
var ThreadProcessor = require('./ThreadProcessor')
var db = require('./db')
var log = require('./log')

// TODO: Make filters use hooks instead of a single function.

var processor = new ThreadProcessor([
  require('./filters/close'),
  require('./filters/quiet'),
  require('./filters/slow'),
  require('./filters/ama'),
  require('./filters/tweet'),
  require('./filters/sentiment')
])

var watcher = null
db.on('value', function (snapshot) {
  var group = new Group(snapshot.val())

  if (watcher) watcher.stop()
  watcher = new GroupWatcher(group, function (thread) {
    return processor.process(group, thread).catch(function (err) {
      log.error(err, 'error processing thread (%s)', thread[0].id)
    })
  })
})
