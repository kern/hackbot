// TODO: Complete this module's docs.

var _ = require('lodash')

var ThreadProcessor = module.exports = function (filters) {

  this.filters = filters

}

/**
 * A filter function for a group thread.
 * @interface
 * @callback Filter
 * @param {Group} group
 * @param {Post[]} thread
 * @return {Promise}
 */

ThreadProcessor.prototype.process = function (group, thread) {

  return Promise.all(_.map(this.filters, function (filter) {
    return filter(group, thread)
  }))

}
