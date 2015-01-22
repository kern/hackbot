var config = require('../config.json');

var Post = require('./Post');
Post.modIDs = config.modIDs;

var FB = require('fb');
FB.setAccessToken(process.env.ACCESS_TOKEN);

var startRefreshing = require('./feed').startRefreshing;
startRefreshing(config.groupID, config.refreshRate, [
  require('./filters/closed')
]);

var startApp = require('./app').start;
startApp(process.env.PORT || config.defaultPort);
