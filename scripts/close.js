/** @module */

const CLOSE_COMMANDS = ['close', 'lock', 'thread']

function isClosePost (post) {
  return post.command != null && CLOSE_COMMANDS.indexOf(post.command) !== -1
}

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/thread" command, and automatically deletes all
 * non-moderator posts after it.
 */
export default function (emitter, log) {

  emitter.on('new', (post, state) => {

    if (!post.isMod) {
      state.get().then(s => {
        if (s.closed) {

          emitter.client.del(post.id).then(() => {
            log.info('deleted post in closed thread', post)
          })

        }
      })
    } else if (isClosePost(post)) {
      log.info('closed thread', post)
      state.update({ closed: true })
    }

  })

}
