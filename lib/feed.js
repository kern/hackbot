/**
 * Processes a Facebook Group's feed. Allows you to run each group thread
 * through any number of filters which expose auto-modertor functionality.
 * @module
 */

var Post = require('./Post')
var Promise = require('es6-promise').Promise
var _ = require('underscore')

/**
 * The query parameters used to refresh a group.
 * @constant {Object}
 */
var refreshParams = {
  fields: 'from,message,created_time,updated_time,comments.limit(1000){from,message,created_time}',
  limit: 10
}

/**
 * Returns the path of the group.
 * @param {Group} group
 * @return {string}
 */
function feedPath(group) {
  return group.id + '/feed'
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

/**
 * Applies multiple actions simultaneously.
 * @param {Action[]} actions
 * @returns {Promise}
 */
function applyActions(actions) {
  var promises = _.map(actions, function (a) {
    return a.apply()
  })

  return Promise.all(promises)
}

/**
 * Sequentially updates a thread using multiple actions.
 * @param {Post[]} thread
 * @param {Action[]} actions
 * @returns {Post[]}
 */
function updateThread(thread, actions) {
  for (var action of actions) {
    thread = action.update(thread)
  }

  return thread
}

/**
 * Refreshes a group by running its feed through a list of
 * filters.
 * @param {Group} group
 * @param {module:feed~Filter[]} filters
 * @return {Promise}
 */
exports.refresh = function(group, filters) {
  var path = feedPath(group)
  return group.client.get(path, refreshParams)
    .then(function(body) {
      var feed = fromRaw(body)
      var actions = []

      for (var thread of feed) {
        for (var filter of filters) {
          var filterActions = filter(group, thread)
          actions.push(filterActions)
          thread = updateThread(thread, filterActions)
        }
      }

      return applyActions(_.flatten(actions))
    })
}

/**
 * A filter function for a group thread.
 * @interface
 * @callback Filter
 * @param {Group} group
 * @param {Post[]} thread
 * @return {Action[]}
 */

/**
 * A side-effect from a filter.
 * @interface Action
 */

/**
 * Executes the action.
 * @function module:feed~Action#apply
 * @returns {Promise}
 */

/**
 * Updates a thread to reflect the application of an action.
 * @function module:feed~Action#update
 * @param {Post[]} thread
 * @returns {Post[]}
 */
