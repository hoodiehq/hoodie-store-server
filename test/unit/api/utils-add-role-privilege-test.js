var test = require('tap').test

var addRolePrivilege = require('../../../api/utils/add-role-privilege')

test('addRolePrivilege(access, role, privilege)', function (t) {
  var access
  var expected

  access = {
    read: {
      role: []
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
  addRolePrivilege(access, true, 'read')
  t.same(access, expected, 'set public read')

  access = {
    read: {
      role: []
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
      role: true
    }
  }
  addRolePrivilege(access, true, 'write')
  t.same(access, expected, 'set public write')

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
      role: ['foo', 'bar', 'baz']
    },
    write: {
      role: []
    }
  }
  addRolePrivilege(access, 'baz', 'read')
  t.same(access, expected, 'add role')

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
      role: ['foo', 'bar']
    },
    write: {
      role: []
    }
  }
  addRolePrivilege(access, 'foo', 'read')
  t.same(access, expected, 'don’t add role if existent')

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
      role: true
    },
    write: {
      role: []
    }
  }
  addRolePrivilege(access, true, 'read')
  t.same(access, expected, 'replace roles with true')

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
      role: ['foo', 'bar', 'baz']
    },
    write: {
      role: []
    }
  }
  addRolePrivilege(access, ['bar', 'baz'], 'read')
  t.same(access, expected, 'merge roles')

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
  addRolePrivilege(access, ['foo'], 'read')
  t.same(access, expected, 'adding ready access to public-read has no effect')

  t.end()
})
