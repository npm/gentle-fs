const t = require('tap')

const requireInject = require('require-inject')

const linkIfExistsCalled = []
const cmdShimIfExistsCalled = []
const enoent = Object.assign(new Error('not found'), { code: 'ENOENT' })
const weirdError = Object.assign(new Error('so weird'), { code: 'EWEIRD' })
const notashim = Object.assign(new Error('not a shim'), { code: 'ENOTASHIM' })

const readCmdShimResults = {
  '/not-found': [enoent],
  '/not-found.cmd': [enoent],
  '/not-found.ps1': [enoent],
  '/one-in-pkg': [null, '/path/to/package'],
  '/one-in-pkg.cmd': [enoent],
  '/one-in-pkg.ps1': [enoent],
  '/two-in-pkg': [null, '/path/to/package'],
  '/two-in-pkg.cmd': [null, '/path/to/package'],
  '/two-in-pkg.ps1': [enoent],
  '/all-in-pkg': [null, '/path/to/package'],
  '/all-in-pkg.cmd': [null, '/path/to/package'],
  '/all-in-pkg.ps1': [null, '/path/to/package'],
  '/weird-error': [null, '/path/to/package/bin/foo'],
  '/weird-error.cmd': [weirdError],
  '/weird-error.ps1': [null, '/path/to/package/what/why/is/it/different/idk'],
  '/not/a/shim': [notashim],
  '/not/a/shim.cmd': [notashim],
  '/not/a/shim.ps1': [notashim],
  '/other/package': [null, '/some/other/package'],
  '/other/package.cmd': [null, '/some/other/package'],
  '/other/package.ps1': [null, '/some/other/package']
}

const binLink = requireInject('../../lib/bin-link.js', {
  '../../lib/link.js': {
    linkIfExists: (from, to, opts, cb) => {
      linkIfExistsCalled.push(from, to, opts)
      process.nextTick(cb)
    }
  },
  'cmd-shim': {
    ifExists: (from, to, cb) => {
      cmdShimIfExistsCalled.push(from, to)
      process.nextTick(cb)
    }
  },
  'read-cmd-shim': (path, cb) => {
    if (readCmdShimResults[path]) {
      return cb(readCmdShimResults[path][0], readCmdShimResults[path][1])
    }

    console.error('READ CMD SHIM', path)
    return cb(Object.assign(new Error('not found'), {
      code: 'ENOENT',
      path
    }))
  }
})

t.test('on unix, just call linkIfExists', t => {
  const opts = {}
  if (process.platform === 'win32') {
    opts._FAKE_PLATFORM_ = 'unix, I swear'
  }
  const from = { from: true }
  const to = { to: true }
  binLink(from, to, opts, () => {
    t.strictSame(linkIfExistsCalled, [ from, to, opts ])
    linkIfExistsCalled.length = 0
    t.end()
  })
})

t.test('on windows, create the shim', t => {
  const _FAKE_PLATFORM_ = process.platform === 'win32' ? null : 'win32'

  t.test('no clobberLinkGently', t => {
    binLink('/path/to/package/bin/from', '/path/to', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: false
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(cmdShimIfExistsCalled, [
        '/path/to/package/bin/from',
        '/path/to'
      ])
      cmdShimIfExistsCalled.length = 0
      t.end()
    })
  })

  t.test('force = true', t => {
    binLink('/path/to/package/bin/from', '/path/to', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: true
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(cmdShimIfExistsCalled, [
        '/path/to/package/bin/from',
        '/path/to'
      ])
      cmdShimIfExistsCalled.length = 0
      t.end()
    })
  })

  t.test('gently not a string', t => {
    binLink('/path/to/package/bin/from', '/path/to', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(cmdShimIfExistsCalled, [
        '/path/to/package/bin/from',
        '/path/to'
      ])
      cmdShimIfExistsCalled.length = 0
      t.end()
    })
  })

  t.test('gently is empty string', t => {
    binLink('/path/to/package/bin/from', '/path/to', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false,
      gently: ''
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(cmdShimIfExistsCalled, [
        '/path/to/package/bin/from',
        '/path/to'
      ])
      cmdShimIfExistsCalled.length = 0
      t.end()
    })
  })

  t.test('shims not found', t => {
    binLink('/path/to/package/bin/from', '/not-found', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false,
      gently: '/path/to/package'
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(cmdShimIfExistsCalled, [
        '/path/to/package/bin/from',
        '/not-found'
      ])
      cmdShimIfExistsCalled.length = 0
      t.end()
    })
  })

  t.test('shim(s) found, in pkg', t => {
    const targets = ['/one-in-pkg', '/two-in-pkg', '/all-in-pkg']
    t.plan(targets.length)
    targets.forEach(target => t.test(target, t => {
      binLink('/path/to/package/bin/from', target, {
        _FAKE_PLATFORM_: _FAKE_PLATFORM_,
        clobberLinkGently: true,
        force: false,
        gently: '/path/to/package'
      }, (er) => {
        if (er) {
          throw er
        }
        t.strictSame(cmdShimIfExistsCalled, [
          '/path/to/package/bin/from',
          target
        ])
        cmdShimIfExistsCalled.length = 0
        t.end()
      })
    }))
  })

  t.end()
})

t.test('windows, do not create the shim', t => {
  const _FAKE_PLATFORM_ = process.platform === 'win32' ? null : 'win32'

  t.test('weird error', t => {
    binLink('/path/to/package/bin/from', '/weird-error', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false,
      gently: '/path/to/package'
    }, (er) => {
      t.equal(er, weirdError, 'got weird error')
      t.equal(cmdShimIfExistsCalled.length, 0, 'did not try to create shim')
      t.end()
    })
  })

  t.test('found, but not a shim', t => {
    binLink('/path/to/package/bin/from', '/not/a/shim', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false,
      gently: '/path/to/package'
    }, (er) => {
      t.match(er, {
        code: 'EEXIST',
        path: '/path/to/package/bin/from',
        dest: '/not/a/shim'
      }, 'got simulated EEXIST error')
      t.equal(cmdShimIfExistsCalled.length, 0, 'did not try to create shim')
      t.end()
    })
  })

  t.test('found, but not our package', t => {
    binLink('/path/to/package/bin/from', '/other/package', {
      _FAKE_PLATFORM_: _FAKE_PLATFORM_,
      clobberLinkGently: true,
      force: false,
      gently: '/path/to/package'
    }, (er) => {
      t.match(er, {
        code: 'EEXIST',
        path: '/path/to/package/bin/from',
        dest: '/other/package'
      }, 'got simulated EEXIST error')
      t.equal(cmdShimIfExistsCalled.length, 0, 'did not try to create shim')
      t.end()
    })
  })

  t.end()
})
