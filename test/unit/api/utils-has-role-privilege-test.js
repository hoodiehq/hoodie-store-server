var test = require('tap').test

var hasRolePrivilege = require('../../../api/utils/has-role-privilege')

test('hasRolePrivilege(access, options)', function (t) {
  t.is(hasRolePrivilege({
    read: {
      role: true
    },
    write: {
      role: []
    }
  }, true, 'read'), true, 'public read')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: true
    }
  }, true, 'write'), true, 'public write')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: []
    }
  }, true, 'read'), false, 'no read')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: []
    }
  }, true, 'write'), false, 'no read')

  t.is(hasRolePrivilege({
    read: {
      role: ['acme-inc']
    },
    write: {
      role: []
    }
  }, 'acme-inc', 'read'), true, 'role with read access')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: ['acme-inc']
    }
  }, 'acme-inc', 'write'), true, 'role with write access')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: []
    }
  }, 'foo-inc', 'read'), false, 'role without read access')

  t.is(hasRolePrivilege({
    read: {
      role: []
    },
    write: {
      role: []
    }
  }, 'foo-inc', 'write'), false, 'role without write access')

  t.is(hasRolePrivilege({
    read: {
      role: ['acme-inc']
    },
    write: {
      role: []
    }
  }, ['acme-inc', 'foo', 'bar'], 'read'), true, 'multiple roles, one with access')

  t.end()
})
