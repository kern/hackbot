/** @module */

var fb = require('../fb');
var Promise = require('es6-promise').Promise;
var debug = require('debug')('hackbot:filters:closed');

/**
 * Deletes a post and logs its information.
 * @param {Post} post
 * @returns {Promise}
 */
function delPost(post) {
  return fb.noop(post.id).then(function () {
    debug('Deleted ' + post.id);
  });
}

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/thread" command, and automatically deletes all
 * non-moderator posts after it.
 * @implements module:feed~Filter
 */
module.exports = function(thread) {

  var delPromises = [];
  var closedThread = false;

  thread.forEach(function(post) {
    if (post.isMod() && post.hasCommand('thread')) {
      closedThread = true;
    } else if (!post.isMod() && closedThread) {
      var p = delPost(post);
      delPromises.push(p);
    }
  });

  return Promise.all(delPromises);

};
