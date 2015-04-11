/** @module */

var DeleteAction = require('../actions/DeleteAction')

var quietedMembers = []

/**
 * Allows moderators to quiet-ban members by automatically deleting any post
 * that the member makes.
 * @implements module:feed~Filter
 */
module.exports = function(thread) {

  var actions = []

  thread.forEach(function(post) {
    if (quietedMembers.indexOf(post.from) !== -1) {
      actions.push(new DeleteAction(post))
    }
  })

  return actions

}
