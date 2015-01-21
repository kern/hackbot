var config = require('./config.json');
var express = require('express');

var FB = require('fb');
FB.setAccessToken(process.env.ACCESS_TOKEN);

var refreshLocked = require('./locked').refresh;

function refresh() {
  console.log('Refreshing...');

  refreshLocked(config.groupID, config.adminIDs).then(function(cids) {
    cids.forEach(function(cid) {
      console.log('Deleted: ' + cid);
    });

    setTimeout(refresh, config.refreshRate);
  }, function(err) {
    console.log(err);
  });
}

refresh();

var app = express();

app.get('/', function(req, res) {
  res.send("Hello from Hackathon Hackbot! <3");
});

app.listen(process.env.PORT || 3000);
