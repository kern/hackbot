var app = require('./app');
var config = require('../config.json');
var debug = require('debug')('hackbot');
var feed = require('./feed');
var refresher = require('./refresher');

var filters = [
  require('./filters/closed')
];

debug('Started refreshing every ' + config.refreshRate + 'ms');
refresher(config.refreshRate, function () {
  debug('Refreshing...');
  return feed.refresh(config.groupID, filters)
    .catch(function (err) {
      debug('Error:', err);
      console.log(err.stack);
    });
});

app.start(process.env.PORT || config.defaultPort);
