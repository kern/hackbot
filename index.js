#! /usr/bin/env node
import CLI from './lib/CLI'

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

const cli = new CLI(process.argv.slice(2))
cli.run()
