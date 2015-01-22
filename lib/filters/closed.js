var Promise = require('es6-promise').Promise;
var debug = require('debug')('hackbot:filters:closed');

module.exports = function(feed) {
  return new Promise(function(resolve, reject) { 

    var deleteQueue = [];
    feed.forEach(function(thread) {
      var op = thread[0].from;
      var closedThread = false;

      thread.forEach(function(post) {
        if (!post.isAdmin() && closedThread) {
          deleteQueue.push(post);

        } else if ((post.isAdmin() || post.from === op) &&
                   post.hasCommand('thread')) {
          closedThread = true;
        }
      });
    });

    if (deleteQueue.length === 0) return resolve([]);

    var deleteCount = 0;
    deleteQueue.forEach(function(post) {
      FB.api(post.id, 'delete', function(res) {
        debug('Deleted ' + post.id);
        deleteCount++;
        if (deleteCount === deleteQueue.length) resolve(deleteQueue);
      });
    });

  });
};
