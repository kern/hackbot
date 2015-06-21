var app = require('./app');
var config = require('../config.json');
var feed = require('./feed');
var log = require('./log');
var refresher = require('./refresher');

var filters = [
  require('./filters/closed'),
  require('./filters/slow')
];

log.info({ rate: config.refreshRate }, 'started refreshing');
refresher(config.refreshRate, function () {
  log.info('refreshing');
  return feed.refresh(config.groupID, filters)
    .catch(function (err) {
      log.error(err, 'error while refreshing');
    });
});

app.start(process.env.PORT || config.defaultPort);
