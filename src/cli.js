#! /usr/bin/env node

import log from './log'
import ChangeEmitter from './ChangeEmitter'
import record from './record'

process.on('uncaughtException', ex => {
  console.error(ex)
  console.log('Exiting due to uncaught exception...')
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  p.catch(err => {
    console.error(err.stack)
    console.log('Exiting due to unhandled rejection...')
    process.exit(1)
  })
})

process.on('SIGINT', () => {
  console.log('Exiting...')
  process.exit(0)
})

class CLIArgs {

  constructor (args) {
    this.obj = {}
    let nextPos = 0
    let flag = null
    for (let a of args) {
      if (a.indexOf('-') === 0) {
        this.obj[a] = this.obj[a] || []
        flag = a
      } else if (flag == null) {
        this.obj[nextPos] = (this.obj[nextPos] || []).concat([a])
        nextPos++
      } else {
        this.obj[flag] = this.obj[flag].concat([a])
        flag = null
      }
    }
  }

  asRaw (...flags) {
    const allArgs = flags.map(f => this.obj[f.toString()] || [])
    return [].concat(...allArgs)
  }

  asString (...flags) {
    return this.asRaw(...flags).join('')
  }

  asInteger (...flags) {
    const ints = this.asRaw(...flags)
    if (ints.length === 0) {
      return Number.NaN
    } else {
      return parseInt(ints[0], 10)
    }
  }

  asStringArray (...flags) {
    const res = this.asRaw(...flags).join(',').split(',')
    return (res[0] === '' ? [] : res)
  }

}

export default class CLI {

  constructor (args) {

    if (args.length === 0 ||
        args.indexOf('-h') !== -1 ||
        args.indexOf('--help') !== -1) {

      this.mode = this.help

    } else {

      this.mode = this.watch
      this.opts = {
        interval: 5000,
        accessToken: null,
        groupID: null,
        mods: [],
        scripts: [],
        dbFilename: 'hackbot.db',
        recordDir: 'record'
      }

      this.processArgs(args)
    }
  }

  processArgs (args) {

    const cliArgs = new CLIArgs(args)

    this.opts.groupID = cliArgs.asString(0)
    if (this.opts.groupID === '') {
      log.error('you must provide a Facebook Group ID')
      process.exit(1)
    }

    this.opts.accessToken = cliArgs.asString(1)
    if (this.opts.accessToken === '') {
      log.error('you must provide a Facebook access token')
      process.exit(1)
    }

    const i = cliArgs.asInteger('-i', '--interval')
    if (!isNaN(i) && i > 0) { this.opts.interval = i }

    this.opts.mods = cliArgs.asStringArray('-m', '--mod', '--mods')
    if (this.opts.mods.length === 0) {
      log.error('you must provide at least one moderator ID using -m')
      process.exit(1)
    }

    this.opts.scripts = cliArgs.asStringArray('-s', '--script', '--scripts')
    if (this.opts.scripts.length === 0) {
      log.error('you must provide at least one script using -s')
      process.exit(1)
    }

    const d = cliArgs.asString('-d', '--database')
    if (d !== '') { this.opts.dbFilename = d }

    const r = cliArgs.asString('-r', '--record')
    if (r !== '') { this.opts.recordDir = r }

  }

  run () {
    this.mode.apply(this)
  }

  help () {
    log([
      'usage: hackbot <group> <access-token> [<args>...]'
    ].join('\n'))
  }

  watch () {
    const emitter = new ChangeEmitter(this.opts)
    log('started with database',
        { filename: this.opts.dbFilename })

    for (let script of this.opts.scripts) {
      try {
        log('loading script', { name: script })
        const { attach } = require(`./scripts/${script}`)
        attach(emitter, record(this.opts.recordDir))
      } catch (ex) {
        log.error('no such script', { name: script })
        process.exit(1)
      }
    }
  }

}

const cli = new CLI(process.argv.slice(2))
cli.run()
