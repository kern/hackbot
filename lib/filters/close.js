/** @module */

var log = require('../log')

var CLOSE_COMMANDS = ['close', 'lock', 'thread']

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/thread" command, and automatically deletes all
 * non-moderator posts after it.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var promises = []
  var closedThread = false

  for (var post of thread) {
    var isMod = group.isMod(post.from)

    if (isMod && post.hasCommand(CLOSE_COMMANDS)) {
      closedThread = true
    } else if (closedThread && !isMod) {
      (function (post) {
        var p = group.client.del(post.id).then(function () {
          log.info({ post: post }, '/close deleted post with ID: %s', post.id)
        })

        promises.push(p)
      })(post)
    }
  }

  return Promise.all(promises)

}
