/** @module */

var DeleteAction = require('../actions/DeleteAction')

/**
 * Allows moderators to quiet-ban members by automatically deleting any post
 * that the member makes.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var actions = []

  for (var post of thread) {
    // if (group.isQuieted(post.from, post.created)) {
      actions.push(new DeleteAction(group, post))
    // }
  }

  return actions

}
