var PouchDB = require('pouchdb-core').plugin(require('pouchdb-adapter-memory'))
var test = require('tap').test

var StoreAPIFactory = require('../../../api')

test('Store', function (group) {
  group.test('API', function (t) {
    var Store = StoreAPIFactory(PouchDB)

    t.is(typeof Store.adapter, 'string', 'Store.adapter')
    t.is(typeof Store.create, 'function', 'Store.create()')
    t.is(typeof Store.destroy, 'function', 'Store.destroy()')
    t.is(typeof Store.exists, 'function', 'Store.exists()')
    t.is(typeof Store.open, 'function', 'Store.open()')
    t.is(typeof Store.grant, 'function', 'Store.grant()')
    t.is(typeof Store.hasAccess, 'function', 'Store.hasAccess()')
    t.is(typeof Store.revoke, 'function', 'Store.revoke()')
    t.is(typeof Store.replicate, 'function', 'Store.replicate()')
    t.is(typeof Store.cancelReplication, 'function', 'Store.cancelReplication()')

    t.end()
  })
  group.test('Store.open resolves with store instance', function (t) {
    t.plan(2)

    var Store = StoreAPIFactory(PouchDB)

    Store.create('dbname')

    .then(function () {
      return Store.open('dbname')
    })

    .then(function (store) {
      t.is(typeof store.add, 'function', 'returns Store Instance')

      return Store.destroy('dbname')
    })

    .then(t.ok)

    .catch(t.error)
  })

  group.test('create / open / destroy walkthrough', function (t) {
    t.plan(8)

    var Store = StoreAPIFactory(PouchDB)

    Store.create('dbname')

    .then(function (name) {
      t.is(name, 'dbname', 'Store.create resolves with name')

      return Store.create('dbname')
    })

    .then(function () {
      t.fail('Store.create should fail to create a store with name "dbname" twice')
    }, function (error) {
      t.is(error.status, 409, 'Store.create fails because database "dbname" already exists')

      return Store.exists('dbname')
    })

    .then(function (exists) {
      t.is(exists, true, '"dbname" exists')

      return Store.open('dbname')
    })

    .then(function (store) {
      t.is(typeof store.add, 'function', 'opens "dbname" store')

      return store.add({foo: 'bar'})
    })

    .then(function (doc) {
      var db = new PouchDB('dbname')
      return db.get(doc.id)
    })

    .then(function (doc) {
      t.is(doc.foo, 'bar', 'persists data using PouchDB')

      return Store.destroy('dbname')
    })

    .then(function (name) {
      t.is(name, 'dbname', 'Store.destroy resolves with name')

      return Store.exists('dbname')
    })

    .then(function (exists) {
      t.is(exists, false, '"dbname" no longer exists')

      return Store.open('dbname')
    })

    .then(function () {
      t.fail('store.add should fail after "dbname" was destroyed')
    })

    .catch(function (error) {
      t.is(error.status, 404, 'store.add fails because database "dbname" does not exist')
    })
  })

  group.end()
})
