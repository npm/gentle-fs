const t = require('tap')
const index = require('../')
t.match(index, {
  rm: Function,
  link: Function,
  linkIfExists: Function,
  mkdir: Function,
  binLink: Function
}, 'exports all the functions')
