var config = require('../config.json')
var modIDs = config.modIDs

/**
 * A single Facebook post or comment.
 * @class
 */
var Post = module.exports = function (id) {

  /** @member {string} */
  this.id = id

  /** @member {string} */
  this.from = ''

  /** @member {string} */
  this.message = ''

}

/**
 * Converts a raw JSON-formatted post from a response body into an object.
 * @param {Object} raw
 * @return {Post}
 */
Post.fromRaw = function (raw) {
  var post = new Post(raw.id)
  post.from = raw.from ? raw.from.id : '0'
  post.message = raw.message || ''
  return post
}

/**
 * Determines if the poster was a group moderator.
 * @returns {boolean}
 */
Post.prototype.isMod = function () {
  return modIDs.indexOf(this.from) !== -1
}

/**
 * Determines if the post contains a moderative command. Commands begin with a
 * forward slash, followed by any number of alphanumeric characters.
 * @param {string} cmd
 * @returns {boolean}
 */
Post.prototype.hasCommand = function (cmd) {
  return this.message.match('^/' + cmd + '(?: |$)')
}
