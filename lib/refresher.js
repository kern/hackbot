/** @module */

/**
 * Creates a refresher that calls a function periodically as long as the
 * previous call has finished. The function is called immediately after the
 * refresher is created. You can cancel a refresher using `clearInterval`.
 *
 * @param {number} interval
 * @param {module:refresher~doneFn} fn
 */
module.exports = function (interval, fn, onError) {

  onError = onError ? onError : function () {}

  var ready = true
  var refresh = function () {

    if (!ready) return
    ready = false

    var p = fn()
    if (p != null) {
      p.then(function () {
        ready = true
      }).catch(function (err) {
        onError(err)
        ready = true
      })
    }

  }

  refresh()
  return setInterval(function () {
    refresh()
  }, interval)

}

/**
 * A function called at each period by a refresher.
 * @callback module:refresher~doneFn
 * @return {Promise}
 */
