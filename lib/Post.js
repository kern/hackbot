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
  this.fromName = ''

  /** @member {string} */
  this.message = ''

  /** @member {Date} */
  this.created = new Date()

  /** @member {String} */
  this.place = null

  /** @member {Object[]} */
  this.tags = []

  /** @member {Object} */
  this.link = {}

}

/**
 * Converts a raw JSON-formatted post from a response body into an object.
 * @param {Object} raw
 * @return {Post}
 */
Post.fromRaw = function (raw) {
  var post = new Post(raw.id)
  post.from = raw.from ? raw.from.id : '0'
  post.fromName = raw.from ? raw.from.name : ''
  post.message = raw.message
  post.created = new Date(raw.created_time)
  post.place = raw.place || null
  post.tags = raw.message_tags || []

  if (raw.link) {
    post.link = {
      url: raw.link,
      caption: raw.caption,
      description: raw.description,
      picture: raw.picture
    }
  }

  return post
}

/**
 * Determines if the post contains a moderative command. Commands begin with a
 * forward slash, followed by any number of alphanumeric characters.
 * @param {string} cmd
 * @returns {boolean}
 */
Post.prototype.hasCommand = function (cmd) {
  if (this.message == null) return false
  if (!(cmd instanceof Array)) cmd = [cmd]
  return this.message.match('^/(' + cmd.join('|') + ')(?: |$)')
}

Post.prototype.getArgs = function () {
  if (this.message == null) return false
  return this.message.replace(/^\/\w+(?: |$)/, '').trim()
}

/**
 * An ordered list of posts. The first post corresponds to the original post on
 * Facebook. All subsequent posts are Facebook comments.
 * @typedef {Post[]} Thread
 */
