/** @module */

var DeleteAction = require('../actions/DeleteAction')

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/thread" command, and automatically deletes all
 * non-moderator posts after it.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var actions = []
  var closedThread = false

  for (var post of thread) {
    var isMod = group.isMod(post.from)
    if (isMod && post.hasCommand('thread')) {
       closedThread = true
    } else if (!isMod && closedThread) {
      var a = new DeleteAction(group, post)
      actions.push(a)
    }
  }

  return actions

}
