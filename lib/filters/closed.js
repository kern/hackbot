var Promise = require('es6-promise').Promise;
var debug = require('debug')('hackbot:filters:closed');

module.exports = function(feed) {
  return new Promise(function(resolve, reject) { 

    var deleteQueue = [];
    feed.forEach(function(thread) {
      var closedThread = false;

      thread.forEach(function(post) {
        if (post.isMod() && post.hasCommand('thread')) {
          closedThread = true;
        } else if (!post.isMod() && closedThread) {
          deleteQueue.push(post);
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
