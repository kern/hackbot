/** @module */

var db = require('../db')
var log = require('../log')
var request = require('request')
var sentiment = require('sentiment')

var METAMIND_URL = 'https://www.metamind.io/language/classify'
var NEG_THRESHOLD = -0.8
var ADMIN_GROUP = '1461229807499165'

var checked = {}
var reportedRef = db.child('reported')
var reported = {}

reportedRef.on('value', function (snapshot) {
  reported = snapshot.val() || {}
})

// An unfortunate hack due to the limitations of the MetaMind free tier, which
// appears to be the only tier available at the moment.
var lastPromise = Promise.resolve()

function getSentiment(post) {
  if (process.env.METAMIND_KEY) {

    var apiKey = process.env.METAMIND_KEY
    var options = {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + apiKey
      },
      json: {
        classifier_id: 155,
        value: post.message
      }
    }

    lastPromise = lastPromise.then(function () {
      return new Promise(function (resolve, reject) {
        request(METAMIND_URL, options, function (err, res, body) {
          if (err) return reject(err)

            if (res.statusCode == 200) {
              for (var c of body.predictions) {
                if (c.class_id === 1) {
                  return resolve(-c.prob)
                }
              }
            }

            reject(res)
        })
      })
    })

    return lastPromise

  } else {

    var s = sentiment(post.message)
    return Promise.resolve(s.comparative)

  }
}

module.exports = function(group, thread) {

  var promises = []

  for (var post of thread) {
    var checksum = post.getChecksum()

    if (checksum in checked ||
        post.id in reported ||
        post.message == null) continue

    checked[checksum] = true

    !(function (post, checksum) {

      var p = getSentiment(post).then(function (s) {

        if (s < NEG_THRESHOLD) {

          reportedRef.child(post.id).set(new Date().getTime())

          var params = {
            name: '⚠ ' + post.fromName + ' // ' + post.id,
            description: '(Score: ' + s + ') ' + post.message,
            link: 'http://facebook.com/' + post.id
          }

          return group.client.post(ADMIN_GROUP + '/feed', params).then(function () {
            log.info({ post: post }, 'reported post with ID: %s (Score: %s)', post.id, s)
          })

        }

      }, function (err) {
        log.error(err, 'error classifying post with ID: %s. Retrying...', post.id)
        delete checked[checksum]
      })

      promises.push(p)

    })(post, checksum)
  }

  return Promise.all(promises)

}
