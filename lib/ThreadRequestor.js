var Post = require('./Post')
var Promise = require('es6-promise').Promise
var _ = require('underscore')

/**
 * The fields parameters used to update a group topic.
 * @constant {Object}
 */
var REFRESH_FIELDS = [
  'from', 'message',
  'created_time', 'updated_time',
  'place', 'message_tags',
  'link', 'caption', 'description', 'picture'
  'comments.limit(1000){' + [
    'from', 'message',
    'created_time', 'updated_time',
    'place', 'message_tags',
    'link', 'caption', 'description', 'picture'
  ].join() + '}',
].join()

/**
 * The number of threads retrieved from the latest part of the feed.
 * @constant {Object}
 */
var LATEST_LIMIT = 10

/**
 * Converts a raw request body into a feed. 
 * @param {Object} body
 * @return {Thread[]}
 */
function fromRaw(body) {
  if (body.data) {
    return _.flatten(_.map(body.data, fromRaw))
  } else {
    var op = Post.fromRaw(body)
    var thread = [op]

    var rawComments = rawPost.comments ? rawPost.comments.data : []
    rawComments.forEach(function (raw) {
      var cmt = Post.fromRaw(raw)
      thread.push(cmt)
    })

    return thread
  }
}

function triggerRequest = function(path, params) {
  return group.client.get(path, params)
    .then(function (body) {
      var feed = fromRaw(body)
      return _.map(feed, self.callback)
    })
}

var ThreadRequestor = function (group, callback) {

  this.group = group
  this.callback = callback
  this.path = group.id + '/feed'

}

ThreadRequestor.getOne = function (id) {
  return triggerRequest(id, { fields: REFRESH_FIELDS })
}

ThreadRequestor.getLatest = function (latest) {
  return triggerRequest(this.path, {
    fields: REFRESH_FIELDS,
    limit: latest || 5
  })
}
