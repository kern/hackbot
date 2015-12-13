/** @module */

var _ = require('lodash')
var db = require('../db')
var log = require('../log')
var Twit = require('twit')

var TCO_LENGTH = 23
var MAX_TWEET_LENGTH = 140 - TCO_LENGTH - 1

var twitter = null
db.child('twitter_credentials').on('value', function (snapshot) {
  twitter = new Twit(snapshot.val())
})

/**
 * Allows moderators to tweet a link to the thread.
 * @implements module:feed~Filter
 */
module.exports = function(group, thread) {

  var tweetedRef = db.child('tweeted')

  var tweetPosts = _.filter(thread, function (post) {
    return post.hasCommand('tweet') &&
      post.getArgs() !== '' &&
      group.isMod(post.from) &&
      !group.hasTweeted(post)
  })

  return Promise.all(_.map(tweetPosts, function (post) {

    tweetedRef.child(post.id).set(new Date().getTime())
    var postText = post.getArgs().substr(0, MAX_TWEET_LENGTH).trim()
    var postURL = 'fb.com/' + post.id
    var params = { status: postText + ' ' + postURL }

    return new Promise(function (resolve, reject) {
      twitter.post('statuses/update', params, function (err, data, response) {
        if (err) return reject(err)
        resolve(data)
      })
    })

  }))

}
