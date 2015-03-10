/** @module */

/**
 * Creates a refresher that calls a function periodically as long as the
 * previous call has finished. The function is called immediately after the
 * refresher is created. You can cancel a refresher using `clearInterval`.
 *
 * @param {number} interval
 * @param {module:refresher~doneFn} fn
 */
module.exports = function (interval, fn) {

  var ready = true;
  var done = function () {
    ready = true;
  };

  fn().then(done);
  return setInterval(function () {
    if (!ready) return;
    ready = false;
    fn().then(done);
  }, interval);

};

/**
 * A function called at each period by a refresher.
 * @callback module:refresher~doneFn
 * @return {Promise}
 */
