// TODO: Complete this module's docs.

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
 * @param {Thread} thread
 * @param {Action[]} actions
 * @returns {Thread}
 */
function updateThread(thread, actions) {
  for (var action of actions) {
    thread = action.update(thread)
  }

  return thread
}

var ThreadProcessor = module.exports = function (filters) {

  this.filters = filters

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
 * @param {Thread} thread
 * @returns {Thread}
 */

ThreadProcessor.prototype.process = function (group, thread) {

  var actions = []

  for (var filter of this.filters) {
    var filterActions = filter(group, thread)
    actions = actions.concat(filterActions)
    thread = updateThread(thread, filterActions)
  }

  return applyActions(actions)

}
