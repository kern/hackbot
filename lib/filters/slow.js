/** @module */

var moment = require('moment');
var DeleteAction = require('../actions/DeleteAction');
var Promise = require('es6-promise').Promise;

/**
 * Slows the thread, only allowing one post per person per 60 seconds.
 * @implements module:feed~Filter
 */
module.exports = function(thread) {
    var actions = [];

    var slowThread = false;
    var posters = {};

    thread.forEach(function(post) {
        if (post.isMod() && post.hasCommand('slow')) {
            slowThread = true
        } else if (!post.isMod() && slowThread) {
            if (posters[post.from] === undefined) {
              posters[post.from] = post.created_time;
            } else {
              diff = moment.duration(moment(post.created_time).diff(moment(posters[post.from])));
              if (diff.asSeconds() < 60) {
                // console.log("Fast post:", post.from, "posted within", diff.asSeconds());
                var a = new DeleteAction(post);
                actions.push(a)
              } else {
                posters[post.from] = post.created_time;
              }
            }
        }
    });

    return actions;
};
