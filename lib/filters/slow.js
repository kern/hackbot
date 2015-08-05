/** @module */

var Promise = require('es6-promise').Promise
var log = require('../log')
var moment = require('moment')

var RATE_LIMIT_SECONDS = 60

/**
 * Slows the thread, only allowing one post per person per 60 seconds.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

    var promises = []
    var slowedThread = false
    var posters = {}

    for (var post of thread) {
      var isMod = group.isMod(post.from)

      if (isMod && post.hasCommand('slow')) {
        slowedThread = true
      } else if (!isMod && slowedThread) {

        var created = moment(post.created)

        if (post.from in posters) {
          var diff = moment.duration(created.diff(posters[post.from]))
          if (diff.asSeconds() < RATE_LIMIT_SECONDS) {
            (function (post, diff) {
              var p = group.client.del(post.id).then(function () {
                log.info({
                  post: post,
                  diff: diff.asSeconds()
                }, '/slow deleted post with ID: %s', post.id)
              })

              promises.push(p)
            })(post, diff)
          }
        }

        posters[post.from] = created

      }
    }

    return Promise.all(promises)

}
