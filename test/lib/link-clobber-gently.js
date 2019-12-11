const t = require('tap')
const requireInject = require('require-inject')
const sillyLogs = []
const verboseLogs = []
const log = {
  silly: function () { sillyLogs.push.apply(sillyLogs, arguments) },
  verbose: function () { verboseLogs.push.apply(verboseLogs, arguments) }
}

const rmCalled = []
const clobberLinkGently = requireInject('../../lib/link.js', {
  '../../lib/rm.js': (path, opts, cb) => {
    rmCalled.push(path)
    return cb()
  }
})._clobberLinkGently

t.test('current link does not exist, allow it', t => {
  clobberLinkGently('/a/b', '/c/d', {
    currentExists: false,
    log: log
  }, (er) => {
    if (er) {
      throw er
    }
    t.strictSame(verboseLogs, [], 'no verbose logs')
    t.strictSame(sillyLogs, [
      'gently link',
      'link does not already exist',
      {
        link: '/c/d',
        target: '/a/b'
      }
    ])
    sillyLogs.length = 0
    t.strictSame(rmCalled, [], 'rm not called')
    t.end()
  })
})

t.test('use force', t => {
  t.test('no clobber gently', t => {
    clobberLinkGently('/a/b', '/c/d', {
      currentExists: true,
      clobberLinkGently: false,
      log: log
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(verboseLogs, [], 'no verbose logs')
      t.strictSame(sillyLogs, [
        'gently link',
        'deleting existing link forcefully',
        {
          link: '/c/d',
          target: '/a/b',
          force: undefined,
          gently: undefined,
          clobberLinkGently: false
        }
      ])
      t.strictSame(rmCalled, [ '/c/d' ])
      rmCalled.length = 0
      sillyLogs.length = 0
      t.end()
    })
  })

  t.test('--force', t => {
    clobberLinkGently('/a/b', '/c/d', {
      currentExists: true,
      clobberLinkGently: true,
      force: true,
      log: log
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(verboseLogs, [], 'no verbose logs')
      t.strictSame(sillyLogs, [
        'gently link',
        'deleting existing link forcefully',
        {
          link: '/c/d',
          target: '/a/b',
          force: true,
          gently: undefined,
          clobberLinkGently: true
        }
      ])
      t.strictSame(rmCalled, [ '/c/d' ])
      rmCalled.length = 0
      sillyLogs.length = 0
      t.end()
    })
  })

  t.test('falsey gently option', t => {
    clobberLinkGently('/a/b', '/c/d', {
      currentExists: true,
      clobberLinkGently: true,
      force: false,
      gently: '',
      log: log
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(verboseLogs, [], 'no verbose logs')
      t.strictSame(sillyLogs, [
        'gently link',
        'deleting existing link forcefully',
        {
          link: '/c/d',
          target: '/a/b',
          force: false,
          gently: '',
          clobberLinkGently: true
        }
      ])
      sillyLogs.length = 0
      t.strictSame(rmCalled, [ '/c/d' ])
      rmCalled.length = 0
      t.end()
    })
  })

  t.test('no string gently path', t => {
    clobberLinkGently('/a/b', '/c/d', {
      currentExists: true,
      clobberLinkGently: true,
      force: false,
      gently: true,
      log: log
    }, (er) => {
      if (er) {
        throw er
      }
      t.strictSame(verboseLogs, [], 'no verbose logs')
      t.strictSame(sillyLogs, [
        'gently link',
        'deleting existing link forcefully',
        {
          link: '/c/d',
          target: '/a/b',
          force: false,
          gently: true,
          clobberLinkGently: true
        }
      ])
      sillyLogs.length = 0
      t.strictSame(rmCalled, [ '/c/d' ])
      rmCalled.length = 0
      t.end()
    })
  })
  t.end()
})

t.test('current is not a link, do not remove', t => {
  clobberLinkGently('/path/to/package/bin/foo', '/a/b', {
    currentExists: true,
    currentIsLink: false,
    clobberLinkGently: true,
    force: false,
    gently: '/path/to/package',
    log: log
  }, (er) => {
    if (er) {
      throw er
    }
    t.strictSame(verboseLogs, [
      'gently link',
      'cannot remove, not a link',
      '/a/b'
    ], 'expected verbose logs')
    verboseLogs.length = 0
    t.strictSame(sillyLogs, [], 'no sillylogs')
    t.strictEqual(rmCalled.length, 0, 'rm not called')
    t.strictSame(rmCalled, [], 'rm not called')
    t.end()
  })
})

t.test('current is link to another place', t => {
  clobberLinkGently('/path/to/package/bin/foo', '/a/b', {
    currentExists: true,
    currentIsLink: true,
    currentTarget: '/some/other/place',
    clobberLinkGently: true,
    force: false,
    gently: '/path/to/package',
    log: log
  }, (er) => {
    if (er) {
      throw er
    }
    t.strictSame(verboseLogs, [
      'gently link',
      'refusing to delete existing link',
      {
        link: '/a/b',
        currentTarget: '/some/other/place',
        newTarget: '/path/to/package/bin/foo',
        gently: '/path/to/package'
      }
    ], 'expected verbose logs')
    verboseLogs.length = 0
    t.strictSame(sillyLogs, [], 'no sillylogs')
    t.strictEqual(rmCalled.length, 0, 'rm not called')
    t.strictSame(rmCalled, [], 'rm not called')
    t.end()
  })
})

t.test('link is ours, delete it!', t => {
  clobberLinkGently('/path/to/package/bin/foo', '/a/b', {
    currentExists: true,
    currentIsLink: true,
    currentTarget: '/path/to/package/bin/bar',
    clobberLinkGently: true,
    force: false,
    gently: '/path/to/package',
    log: log
  }, (er) => {
    if (er) {
      throw er
    }
    t.strictSame(verboseLogs, [], 'no verbose logs')
    verboseLogs.length = 0
    t.strictSame(sillyLogs, [
      'gently link',
      'delete existing link',
      '/a/b'
    ], 'sillylogs')
    t.strictSame(rmCalled, ['/a/b'], 'rm called')
    t.end()
  })
})
