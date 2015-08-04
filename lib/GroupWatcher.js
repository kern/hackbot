/**
 * Processes a Facebook Group's feed. Allows you to run each group thread
 * through any number of filters which expose auto-modertor functionality.
 * @module
 */

var Post = require('./Post')
var Promise = require('es6-promise').Promise
var _ = require('underscore')
var log = require('./log')
var refresher = require('./refresher')

/**
 * The query parameters used to poll a group.
 * @constant {Object}
 */
var REFRESH_PARAMS = {

  fields: [
    'from', 'message',
    'created_time', 'updated_time',
    'place', 'message_tags',
    'link', 'caption', 'description', 'picture',
    'comments.limit(1000){' + [
      'from', 'message', 'created_time', 'message_tags'
    ].join() + '}',
  ].join(),

  limit: 10

}

/**
 * The polling rate.
 * @constant
 * @default
 */
var REFRESH_RATE = 1000

/**
 * Converts a raw request body into a feed. 
 * @param {Object} body
 * @return {Thread[]}
 */
function fromRaw(body) {
  return _.map(body.data, function (rawPost) {

    var op = Post.fromRaw(rawPost)
    var thread = [op]

    var rawComments = rawPost.comments ? rawPost.comments.data : []
    rawComments.forEach(function (raw) {
      var cmt = Post.fromRaw(raw)
      thread.push(cmt)
    })

    return thread

  })
}

/**
 * Watches a Facebook Group's feed for new posts and comments.
 *
 * 10 threads and 1000 of each of their comments are retrieved at a time,
 * sorted by a field on the original post called `updated_time`. This time is
 * first set when the post is created and later whenever a new comment is made.
 * It is not updated when posts or comments are edited.
 *
 * User posts, group description updates, and admin promotions are included in
 * the feed. Polls, pinned posts, and hidden posts are not included in the
 * feed. Perhaps in a future version of the Graph API, these will be.
 *
 * Unfortunately, the Facebook Graph API does not currently provide a way to
 * subscribe to a group's posts or comments. If a user is quick enough to post
 * or comment in more than 10 threads faster than the poll rate, Hackbot will
 * not process past the 10th thread until it receives a new comment. This type
 * of attack should be against group policies regardless and will likely either
 * be handled automatically by Facebook's spam detector or a bannable offense.
 *
 * Another way to temporarily circumvent processing is by editing a post or
 * comment. Once a new comment is added, however, the edited version of the
 * message will be noticed.
 *
 * Yet another way to get around processing is to have over 1000 comments on a
 * single post. We've yet to encounter a situation like this on Hackathon
 * Hackers, so I'd assume your group won't have any issues.
 *
 * @param {Group} group
 * @param {ThreadCallback} callback
 */
var GroupWatcher = module.exports = function (group, callback) {

  this.group = group
  this.callback = callback

  this.path = group.id + '/feed'
  this.running = false

  var self = this
  this.interval = refresher(REFRESH_RATE, function () {
    return self.trigger()
  })

}

/**
 * A callback for processing a thread.
 * @callback ThreadCallback
 * @param {Thread} thread
 * @returns {Promise}
 */

/**
 * Manually triggers a request of the group's latest posts. If threads are
 * currently being processed, does nothing.
 *
 * @returns {Promise}
 */
GroupWatcher.prototype.trigger = function () {
  var self = this
  if (self.running) return
  self.running = true

  log.info({ group: self.group.id }, 'refreshing')

  return self.group.client.get(self.group.getFeedPath(), REFRESH_PARAMS)
    .then(function (body) {

      // The Graph request succeeded, so process each thread retrieved using
      // the callback simultaneously. Resolve only when all threads have been
      // processed.
      var feed = fromRaw(body)
      return Promise.all(_.map(feed, self.callback))
        .then(function () {
          self.running = false
        })

    }, function (err) {

      // The Graph request failed, so there's probably something wrong with the
      // group's access token or the group itself.
      err.group = self.group
      log.error(err, 'error requesting group (%s)', self.group.id)
      self.running = false
      throw err

    })
}

/**
 * Stops polling the group. Polling cannot be restarted.
 */
GroupWatcher.prototype.stop = function () {
  if (this.interval) {
    clearInterval(this.interval)
    this.interval = null
  }
}
