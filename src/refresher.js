/** @module */

/**
 * Creates a refresher that calls a function periodically as long as the
 * previous call has finished. The function is called immediately after the
 * refresher is created. You can cancel a refresher using `clearInterval`.
 */
export default function (interval, fn, onError) {

  onError = onError ? onError : () => {}

  let ready = true
  const refresh = () => {

    if (!ready) { return }
    ready = false

    try {

      const p = fn()
      if (p == null) {
        ready = true
      } else {
        p.then(() => {
          ready = true
        }).catch(err => {
          onError(err)
          ready = true
        })
      }

    } catch (err) {
      onError(err)
      ready = true
    }

  }

  refresh()
  return setInterval(() => refresh(), interval)

}
