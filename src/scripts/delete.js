/** @module */

const DELETE_COMMANDS = ['delete', 'mod', 'moderate']

function isDeletePost (post) {
  return post.command != null && DELETE_COMMANDS.indexOf(post.command) !== -1
}

/**
 * Allows moderators to close comment threads. Looks for the first comment by a
 * moderator to issue the "/delete" command, and automatically deletes all
 * non-moderator posts after it.
 */
export function attach (emitter, record) {

  emitter.on('new', (post, state) => {
    if (post.isMod && isDeletePost(post) && post.level > 0) {
      const parent = post.parent
      emitter.client.del(parent.id).then(() => {
        record('delete', { post: parent })
      })
    }
  })

}
