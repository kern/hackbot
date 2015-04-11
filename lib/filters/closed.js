/** @module */

var DeleteAction = require('../actions/DeleteAction')
var Promise = require('es6-promise').Promise

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/thread" command, and automatically deletes all
 * non-moderator posts after it.
 * @implements module:feed~Filter
 */
module.exports = function(thread) {

  var actions = []
  var closedThread = false

  thread.forEach(function(post) {
    if (post.isMod() && post.hasCommand('thread')) {
       closedThread = true
    } else if (!post.isMod() && closedThread) {
      var a = new DeleteAction(post)
      actions.push(a)
    }
  })

  return actions

}
