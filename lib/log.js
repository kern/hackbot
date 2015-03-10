var bunyan = require('bunyan');
var path = require('path');

module.exports = bunyan.createLogger({
  name: 'hackbot',
  streams: [
    {
      stream: process.stdout
    },
    {
      type: 'rotating-file',
      path: path.resolve(__dirname, '../log/hackbot.log'),
      period: '1d'
    }
  ]
});
