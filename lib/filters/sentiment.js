/** @module */

var db = require('../db')
var log = require('../log')
var sentiment = require('sentiment')

var threshold = -0.5
var adminGroup = '1461229807499165'

var reportedRef = db.child('reported')
var reported = []

reportedRef.on('value', function (snapshot) {
  reported = snapshot.val()
})

module.exports = function(group, thread) {

  var actions = []

  thread.forEach(function (post) {
    if (reported.indexOf(post.id) !== -1) return

    var s = sentiment(post.message)
    if (s.comparative < threshold) {
      var params = { link: 'http://facebook.com/' + post.id }
      group.client.post(adminGroup + '/feed', params).then(function () {
        reported.push(post.id)
        reportedRef.set(reported)
        log.info({ post: post }, 'reported post with ID: %s', post.id)
      }).catch(function (err) {
        console.log(err)
      })
    }
  })

  return actions

}
