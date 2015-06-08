var Promise = require('es6-promise').Promise

var TheadQueue = function () {
  this.threads = {}
  this.ordering = []
  this.waiting = []
}

ThreadQueue.prototype.add = function (thread) {
  if (this.waiting.length === 0) {
    if (!thread.id in this.threads) this.ordering.push(thread)
    this.threads[thread.id] = thread
  } else {
    var waiter = this.waiting.shift()
    waiter(thread)
  }
}

ThreadQueue.prototype.pop = function () {
  var self = this
  return new Promise(function (resolve, reject) {
    if (self.ordering.length === 0) {
      self.waiting.push(resolve)
    } else {
      var id = self.ordering.shift()
      var thread = self.threads[id]
      delete self.threads[id]
      resolve(thread)
    }
  })
}
