var fb = require('../fb')
var log = require('../log')

var DeleteAction = module.exports = function (post) {
  this.post = post
}

/**
 * Deletes the post and logs its information.
 * @returns {Promise}
 */
DeleteAction.prototype.apply = function() {

  var post = this.post;
  return fb.del(post.id).then(function () {
    log.info({ post: post }, 'deleted post with ID: %s', post.id)
  })

}

/**
 * Updates a thread to reflect the deletion of a post. If the first post in a
 * thread is deleted, the entire thread is deleted.
 * @param {Post[]} thread
 * @returns {Post[]}
 */
DeleteAction.prototype.update = function(thread) {

  for (var i = 0; i < thread.length;) {
    var p = thread[i]
    if (this.post.id === p.id) {
      if (i === 0) return []
      thread.splice(i, 1)
    } else {
      i++
    }
  }

  return thread

}
