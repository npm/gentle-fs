'use strict'

const rm = require('./lib/rm.js')
const link = require('./lib/link.js')
const BB = require('bluebird')

exports = module.exports = {
  // TODO(mikesherov): use promises directly in rm
  rm: BB.promisify(rm),
  link: link.link,
  linkIfExists: link.linkIfExists
}
