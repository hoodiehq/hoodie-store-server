var PouchDB = require('pouchdb-core').plugin(require('pouchdb-adapter-memory'))
var test = require('tap').test

var StoreAPIFactory = require('../../../api')

test('Store', function (group) {
  group.test('access walkthrough', function (t) {
    t.plan(10)

    var Store = StoreAPIFactory(PouchDB)

    Store.create('dbname')

    .then(function () {
      return Store.hasAccess('dbname', {access: 'read'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, false, 'nobody should have access to a db by default')

      return Store.grant('dbname', {access: 'read'})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: 'read'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, true, 'hasAccess changes after access granted')

      return Store.revoke('dbname', {access: 'read'})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: 'read'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, false, 'hasAccess revoked')

      return Store.grant('dbname', {access: 'read', role: 'foo'})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: 'read'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, false, 'hasAccess({access: "read"}) returns false if read is limited to role')

      return Store.hasAccess('dbname', {access: 'read', role: 'foo'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, true, 'hasAccess({access: "read", role: "foo"}) returns true if that role was granted access before')

      return Store.revoke('dbname', {access: 'read', role: 'foo'})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: 'read', role: 'foo'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, false, 'hasAccess({access: "read", role: "foo"}) returns false after access revoked')

      return Store.grant('dbname', {access: 'write', role: 'bar'})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: 'write', role: ['foo', 'bar', 'baz']})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, true, 'hasAccess({access: "write", role: ["foo", "bar", "baz"]}) returns true if "bar" has write access')

      return Store.grant('dbname', {access: ['read', 'write']})
    })

    .then(function () {
      return Store.hasAccess('dbname', {access: ['read', 'write']})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, true, 'public read / write')

      return Store.grant('unknown', {access: 'read'})
    })

    .then(function () {
      t.fail('Store.grant should reject for non-existing database')
    })

    .catch(function (error) {
      t.is(error.status, 404, 'store.add fails because database "dbname" does not exist')

      return Store.destroy('dbname')
    })

    .then(t.ok)

    .catch(t.error)
  })

  group.test('create with access for "acme-inc"', function (t) {
    t.plan(2)

    var Store = StoreAPIFactory(PouchDB)

    Store.create('secure-db', {
      access: 'read',
      role: 'acme-inc'
    })

    .then(function () {
      return Store.hasAccess('secure-db', {access: 'read'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, false, 'is not public-read')

      return Store.hasAccess('secure-db', {access: 'read', role: 'acme-inc'})
    })

    .then(function (hasAccess) {
      t.is(hasAccess, true, '"acme-inc" has access')
    })

    .catch(t.error)
  })

  group.end()
})
