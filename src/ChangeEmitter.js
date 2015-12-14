import * as log from './log'
import DB from './db'
import FBClient from './FBClient'
import _ from 'lodash'
import crypto from 'crypto'
import refresher from './refresher'
import { EventEmitter } from 'events'

/**
 * The query parameters used to poll a group.
 * @constant {Object}
 */
const REFRESH_PARAMS = {

  fields: [
    'from', 'message', 'type',
    'created_time', 'place', 'message_tags',
    'link', 'caption', 'description', 'picture',
    'comments.limit(1000){' + [
      'from', 'message', 'created_time', 'message_tags',
      'comments.limit(1000){' + [
        'from', 'message', 'created_time', 'message_tags'
      ].join() + '}'
    ].join() + '}'
  ].join(),

  limit: 10

}

function versionHash (post) {
  var s = post.id + '|' + post.from + '|' + (post.message || '')
  return crypto.createHash('sha1').update(s).digest('hex')
}

function messageCommand (message) {
  if (message == null) { return null }
  message = message.trim()
  if (message.indexOf('/') === 0) {
    return message.split(/\s/g)[0].substring(1)
  } else {
    return null
  }
}

function normalizeResponse (raw, group) {

  function normalizePost (raw) {

    let post = {
      id: raw.id,
      level: 0,
      group: group,
      parent: group,
      from: raw.from == null ? '' : raw.from.id,
      fromName: raw.from == null ? '' : raw.from.name,
      type: raw.type || null,
      message: raw.message || '',
      created: new Date(raw.created_time),
      place: raw.place || null,
      tags: raw.message_tags || [],
      link: raw.link == null ? null : {
        url: raw.link,
        caption: raw.caption,
        description: raw.description,
        picture: raw.picture
      },
      comments: [],
      isMod: group.mods.indexOf(raw.from == null ? '' : raw.from.id) !== -1,
      command: messageCommand(raw.message)
    }

    post.version = versionHash(post)

    // Recurse over the post's comments
    if (raw.comments != null) {
      post.comments = raw.comments.data.map(raw => {
        let c = normalizePost(raw)
        c.type = 'comment'
        c.parent = post
        c.level = post.level + 1
        return c
      })
    }

    return post

  }

  return raw.data.map(normalizePost)

}

function walkThread (thread, fn) {

  function walk (post) {
    let s = [fn(post)]
    let r = (post.comments || []).map(walk)
    return s.concat(...r)
  }

  return walk(thread)

}

export default class ChangeEmitter extends EventEmitter {

  constructor (opts) {

    super()

    this.db = new DB(opts.dbFilename)
    this.client = new FBClient(opts.accessToken)
    this.feedPath = opts.groupID + '/feed'
    this.group = {
      id: opts.groupID,
      type: 'group',
      mods: opts.mods
    }

    this.stop = refresher(opts.interval, () => {
      return this.client.get(this.feedPath, REFRESH_PARAMS).then(data => {

        const threads = normalizeResponse(data, this.group)
        return Promise.all(_.flatten(threads.map(thread => {
          return walkThread(thread, post => {
            return this.db.touchVersion(post).then(change => {
              if (change) {
                const state = this.db.threadStateObj(post)
                return [change, post, state]
              } else {
                return null
              }
            })
          })
        }))).then(p => {
          for (let e of _.compact(p)) {
            this.emit(...e)
          }
        })

      })
    }, log.error)

  }

}
