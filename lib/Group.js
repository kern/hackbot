var FBClient = require('./FBClient')
var _ = require('underscore')

/**
 * A Facebook group.
 * @class
 * @param {Object} obj
 */
var Group = module.exports = function (obj) {

  /** @member {string} */
  this.id = obj.id || ''

  /** @member {string[]} */
  this.mods = obj.mods || []

  /** @member {Object.<string, Date>} */
  this.quieted = obj.quieted || {}

  /** @member {[string]} */
  this.tweeted = obj.tweeted || []

  /** @member {FBClient} */
  this.client = new FBClient(obj.accessToken)

}

/**
 * Returns the Group's feed path.
 * @return {string}
 */
Group.prototype.getFeedPath = function () {
  return this.id + '/feed'
}

/**
 * Determines if the user is a group moderator.
 * @param {string} user
 * @return {boolean}
 */
Group.prototype.isMod = function (user) {
  return this.mods.indexOf(user) !== -1
}

/**
 * Determines if the user is quieted.
 * @param {string} user
 * @return {boolean}
 */
Group.prototype.isQuieted = function (user, date) {
  var since = this.quieted[user]
  return since && new Date(since) <= (date || new Date())
}

/**
 * Determines if the post has been tweeted.
 * @param {string} post
 * @return {boolean}
 */
Group.prototype.hasTweeted = function (post) {
  return post.id in this.tweeted
}
