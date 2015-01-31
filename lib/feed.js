var FB = require('fb');
var Post = require('./Post');
var Promise = require('es6-promise').Promise;
var debug = require('debug')('hackbot:feed');

var refreshParams = {
  fields: [
    'from',
    'message',
    'comments.limit(1000){from,message}'
  ],
  limit: 10
};

exports.retrieve = function(groupID) {

  var groupURL = groupID + '/feed';

  return new Promise(function(resolve, reject) {
    FB.api(groupURL, refreshParams, function(res) {
      if (!res || res.error) return reject(res);

      try {
        var feed = [];
        res.data.forEach(function(rawPost) {
          var thread = [Post.fromRaw(rawPost)];

          var rawComments = rawPost.comments ? rawPost.comments.data : [];
          for (var i = 0; i < rawComments.length; i++) {
            var comment = Post.fromRaw(rawComments[i]);
            thread.push(comment);
          }

          feed.push(thread);
        });
      } catch (ex) {
        return reject(ex);
      }

      return resolve(feed);
    });
  });

};

exports.startRefreshing = function(groupID, refreshRate, filterFns) {
  debug('Started refreshing every ' + refreshRate + 'ms');

  function refresh() {
    debug('Refreshing...');

    exports.retrieve(groupID).then(function(feed) {
      var filters = [];
      filterFns.forEach(function(filterFn) {
        filters.push(filterFn(feed));
      });

      Promise.all(filters).then(function(vals) {
        setTimeout(refresh, refreshRate);
      }).catch(function(err) {
        debug('Error running filter:', err);
        setTimeout(refresh, refreshRate);
      });
    }).catch(function(err) {
      debug('Error retrieving feed:', err);
      setTimeout(refresh, refreshRate);
    });
  };

  refresh();
};
