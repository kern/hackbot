/**
 * Processes a Facebook Group's feed. Allows you to run each group thread
 * through any number of filters which expose auto-moderator functionality.
 * @module
 */

var Post = require('./Post')
var Promise = require('es6-promise').Promise
var _ = require('underscore')
var fb = require('./fb')

/**
 * The query parameters used to refresh a group.
 * @constant {Object}
 */
var refreshParams = {
  fields: 'created_time,from,message,comments.limit(1000){from,message,created_time}',
  limit: 10
}

/**
 * Returns the path of the group.
 * @param {string} groupID
 * @return {string}
 */
function feedPath(groupID) {
  return groupID + '/feed'
}

/**
 * Converts a raw request body into a feed. 
 * @param {Object} body
 * @return {Post[][]}
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

function applyActions(actions) {
  var promises = _.map(actions, function (a) {
    return a.apply()
  })

  return Promise.all(promises)
}

function updateThread(thread, actions) {
  return _.reduce(actions, function (memo, action) {
    return action.update(memo)
  }, thread)
}

/**
 * Refreshes a group by running its feed through a list of
 * filters.
 * @param {string} groupID
 * @param {module:feed~Filter[]} filters
 * @return {Promise}
 */
exports.refresh = function(groupID, filters) {
  return fb.get(feedPath(groupID), refreshParams)
    .then(function(body) {
      var feed = fromRaw(body)
      var actions = []

      for (var thread of feed) {
        for (var filter of filters) {
          var filterActions = filter(thread)
          actions.push(filterActions)
          thread = updateThread(thread, filterActions)
        }
      }

      return applyActions(_.flatten(actions))
    })
}

/**
 * A filter function for a thread.
 * @interface
 * @callback Filter
 * @param {Post[]} thread
 * @return {Action[]}
 */
