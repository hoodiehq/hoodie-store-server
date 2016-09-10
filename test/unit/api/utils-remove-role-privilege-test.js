var test = require('tap').test

var removeRolePrivilege = require('../../../api/utils/remove-role-privilege')

test('removeRolePrivilege(access, role, privilege)', function (t) {
  var access
  var expected

  access = {
    read: {
      role: true
    },
    write: {
      role: []
    }
  }
  expected = {
    read: {
      role: []
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, true, 'read')
  t.same(access, expected, 'set no read')

  access = {
    read: {
      role: []
    },
    write: {
      role: true
    }
  }
  expected = {
    read: {
      role: []
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, true, 'write')
  t.same(access, expected, 'set no write')

  access = {
    read: {
      role: ['foo', 'bar']
    },
    write: {
      role: []
    }
  }
  expected = {
    read: {
      role: ['bar']
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, ['foo'], 'read')
  t.same(access, expected, 'remove role')

  access = {
    read: {
      role: ['foo']
    },
    write: {
      role: []
    }
  }
  expected = {
    read: {
      role: ['foo']
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, ['unknown'], 'read')
  t.same(access, expected, 'ignore unknown role')

  access = {
    read: {
      role: ['foo', 'bar', 'baz']
    },
    write: {
      role: []
    }
  }
  expected = {
    read: {
      role: ['bar']
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, ['foo', 'unknown', 'baz'], 'read')
  t.same(access, expected, 'remove multiple')

  // cannot remove read access for real if db is in public-read
  access = {
    read: {
      role: true
    },
    write: {
      role: []
    }
  }
  expected = {
    read: {
      role: true
    },
    write: {
      role: []
    }
  }
  removeRolePrivilege(access, ['foo'], 'read')
  t.same(access, expected, 'set no read')

  t.end()
})
