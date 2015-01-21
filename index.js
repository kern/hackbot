var config = require('./config.json');

var FB = require('fb');
FB.setAccessToken(config.accessToken);

var refreshLocked = require('./locked').refresh;

function refresh() {
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
