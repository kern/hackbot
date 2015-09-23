import NeDB from 'nedb'
import * as log from './log'

function threadID (post) {
  while (post.level > 0) {
    post = post.parent
  }
  return post.id
}

export default class DB {

  constructor (filename) {
    this.db = new NeDB({
      filename: filename,
      autoload: true
    })
  }

  touchVersion (post) {
    return new Promise((resolve, reject) => {
      let query = { graphID: post.id }

      this.db.findOne(query, (err, doc) => {
        if (err) {
          reject(err)
        } else if (doc != null && post.version === doc.version) {
          resolve(false)
        } else {
          this.db.update(query,
                         { graphID: post.id, version: post.version },
                         { upsert: true }, (err, _, newDoc) => {
                           if (err) {
                             reject(err)
                           } else {
                             resolve(newDoc == null ? 'edit' : 'new')
                           }
                         })
        }
      })
    })
  }

  threadStateObj (post) {
    const thread = threadID(post)
    return {
      get: () => { return this.getThreadState(thread) },
      set: (s) => { return this.setThreadState(thread, s) },
      update: (s) => { return this.updateThreadState(thread, s) }
    }
  }

  getThreadState (thread) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ thread: thread }, (err, doc) => {
        if (err) {
          reject(err)
        } else if (doc == null) {
          log.debug('get thread state', thread, {})
          resolve({})
        } else {
          log.debug('get thread state', thread, doc.state)
          resolve(doc.state)
        }
      })
    })
  }

  setThreadState (thread, state) {
    return new Promise((resolve, reject) => {
      this.db.update({ thread: thread },
                     { thread: thread, state: state },
                     { upsert: true }, (err, _, newDoc) => {
                       if (err) {
                         reject(err)
                       } else {
                         log.debug('set thread state', thread, state)
                         resolve()
                       }
                     })
    })
  }

  updateThreadState (thread, updates) {
    return this.getThreadState(thread).then(s => {
      const newState = Object.assign({}, s, updates)
      return this.setThreadState(thread, newState)
    })
  }

}
