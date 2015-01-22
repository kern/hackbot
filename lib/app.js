var debug = require('debug')('hackbot:app');
var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.send('Hello from Hackathon Hackbot! <3');
});

exports.start = function(port) {
  return app.listen(port, function(err) {
    if (err) return debug('Error starting app:', err);
    debug('Started app on port ' + port);
  });
};
