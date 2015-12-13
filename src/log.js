import debug from 'debug'

debug.enable('hackbot')
const log = debug('hackbot')

debug.enable('hackbot:error')
log.error = debug('hackbot:error')

// debug.enable('hackbot:debug')
log.debug = debug('hackbot:debug')

module.exports = log
