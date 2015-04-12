/**
 * A Facebook post or comment.
 * @class
 * @param {string} id
 */
var Post = module.exports = function (id) {

  /** @member {string} */
  this.id = id

  /** @member {string} */
  this.from = ''

  /** @member {string} */
  this.message = ''

  /** @member {Date} */
  this.created = new Date()

  /** @member {Date} */
  this.updated = new Date()

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
  post.created = new Date(raw.created_time)
  post.updated = new Date(raw.updated_time)
  return post
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
