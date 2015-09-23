/** @module */

var log = require('../log')

var AMA_COMMANDS = ['ama', 'only']

/**
 * Allows moderators to lock the thread so only the tagged users may post.
 * Useful for AMA answer threads.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var amaIDs = []
  var promises = []
  var amaThread = false

  for (var post of thread) {
    var isMod = group.isMod(post.from)
    var canPost = isMod || amaIDs.indexOf(post.from) !== -1

    if (isMod && post.hasCommand(AMA_COMMANDS)) {
      amaThread = true
      for (var tag of post.tags) {
        amaIDs.push(tag.id)
      }
    } else if (amaThread && !canPost) {
      (function (post) {
        var p = group.client.del(post.id).then(function () {
          log.info({ post: post }, '/ama deleted post with ID: %s', post.id)
        })

        promises.push(p)
      })(post)
    }
  }

  return Promise.all(promises)

}
