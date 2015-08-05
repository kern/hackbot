/** @module */

var log = require('../log')

/**
 * Allows moderators to quiet-ban members by automatically deleting any post
 * that the member makes.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var promises = []

  for (var post of thread) {
    if (group.isQuieted(post.from, post.created)) {
      (function (post) {
        var p = group.client.del(post.id).then(function () {
          log.info({ post: post }, '/quiet deleted post with ID: %s', post.id)
        })

        promises.push(p)
      })(post)
    }
  }

  return Promise.all(promises)

}
