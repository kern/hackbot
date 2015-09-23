#! /usr/bin/env node
import CLI from './lib/CLI'

process.on('SIGINT', () => {
  console.log('Exiting...')
  process.exit(0)
})

const cli = new CLI(process.argv.slice(2))
cli.run()
