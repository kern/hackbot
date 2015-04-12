var Firebase = require('firebase')
var log = require('./log');

var url = process.env.FIREBASE_URL || 'https://hackbot.firebaseio.com/'
var secret = process.env.FIREBASE_SECRET

if (!secret) throw new Error('FIREBASE_SECRET not set')

var db = module.exports = new Firebase(url)
db.authWithCustomToken(secret, function (err, authData) {
  if (err) {
    log.error({ err: err }, 'Firebase login failed')
  } else {
    log.info({ auth: authData }, 'Firebase login succeeded')
  }
})
