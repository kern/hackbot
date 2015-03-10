var app = require('./app');
var config = require('../config.json');
var feed = require('./feed');
var log = require('./log');
var refresher = require('./refresher');

var filters = [
  require('./filters/closed')
];

log.info({ rate: config.refreshRate }, 'Started refreshing');
refresher(config.refreshRate, function () {
  log.info('Refreshing');
  return feed.refresh(config.groupID, filters)
    .catch(function (err) {
      log.error(err, 'Error while refreshing');
    });
});

app.start(process.env.PORT || config.defaultPort);
