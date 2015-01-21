var config      = require('./config.json');
var groupID     = config.group;
var refreshRate = config.refreshRate;
var adminIDs    = config.adminIDs;

var FB = require('fb');
FB.setAccessToken(config.accessToken);

var groupURL = groupID + '/feed';
var refreshParams = {
  fields: [ 'from', 'comments.limit(1000){from,message}' ],
  limit: 10
};

function refresh() {
  FB.api(groupURL, refreshParams, function(res) {
    if (!res || res.error) {
      console.log(res);
      return;
    }

    console.log('Refreshing...');
    var cidsToDelete = [];

    var posts = res.data;
    posts.forEach(function(post) {
      var pid = post.id;
      var op = post.from.id;
      var comments = post.comments ? post.comments.data : [];

      for (var i = 0; i < comments.length; i++) {
        var comment = comments[i];

        var cid = comment.id;
        var commentator = comment.from.id;
        var message = comment.message;

        var isAdmin = adminIDs.indexOf(commentator) !== -1;
        var isOP = commentator === op;
        var isClose = (/^\/thread/).test(message);

        if ((isAdmin || isOP) && isClose) {
          i++;
          for (; i < comments.length; i++) {
            comment = comments[i];
            cid = comment.id;
            commentator = comment.from.id;
            isAdmin = adminIDs.indexOf(commentator) !== -1;

            if (!isAdmin) {
              cidsToDelete.push(cid);
            }
          }
        }
      }
    });

    var cidsDeleted = 0;
    cidsToDelete.forEach(function(cid) {
      FB.api(cid, 'delete', function(res) {
        console.log('Deleted: ' + cid);
        cidsDeleted++;

        if (cidsDeleted === cidsToDelete.length) {
          setTimeout(refresh, refreshRate);
        }
      });
    });

    if (cidsToDelete.length === 0) {
      setTimeout(refresh, refreshRate);
    }

  });
}

refresh();
