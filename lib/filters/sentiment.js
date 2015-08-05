/** @module */

var db = require('../db')
var log = require('../log')
var sentiment = require('sentiment')

var NEG_THRESHOLD = -0.5
var ADMIN_GROUP = '1461229807499165'

var reportedRef = db.child('reported')
var reported = {}

reportedRef.on('value', function (snapshot) {
  reported = snapshot.val() || {}
})

module.exports = function(group, thread) {

  var promises = []

  for (var post of thread) {
    if (post.id in reported) continue

    var s = sentiment(post.message)
    if (s.comparative < NEG_THRESHOLD) {
      reportedRef.child(post.id).set(new Date().getTime())

      var params = {
        name: '⚠ ' + post.fromName + ' // ' + post.id,
        description: '(Score: ' + s.comparative + ') ' + post.message,
        link: 'http://facebook.com/' + post.id
      }

      !(function (post) {
        var p = group.client.post(ADMIN_GROUP + '/feed', params).then(function () {
          log.info({ post: post }, 'reported post with ID: %s', post.id)
        })

        promises.push(p)
      })(post)
    }
  }

  return Promise.all(promises)

}
