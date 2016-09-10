var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-replication'))
  .plugin(require('pouchdb-adapter-memory'))
var test = require('tap').test

var StoreAPIFactory = require('../../../api')

test('Store', function (group) {
  group.test('replication walkthrough', function (t) {
    t.plan(4)

    var Store = StoreAPIFactory(PouchDB)

    Store.create('db1')

    .then(function () {
      Store.create('db2')
    })

    .then(function () {
      return Store.open('db1')
    })

    .then(function (store) {
      return store.add({id: 'foo'})
    })

    .then(function () {
      return Store.replicate('db1', 'db2')
    })

    .then(function (result) {
      return new Promise(function (resolve, reject) {
        result.replication.on('change', function (change) {
          t.is(change.docs_written, 1, 'replicates 1 doc')
          t.is(change.docs[0]._id, 'foo', 'replicates test doc')
          resolve()
        })
      })
    })

    .then(function () {
      return Store.replicate('db1', 'db2', {live: true})
    })

    .then(function () {
      // simulate bootstrapping of live replications on restart
      var metaDb = new PouchDB('hoodie-store')
      return metaDb.put({
        _id: 'replication_db2_db1',
        source: 'db2',
        target: 'db1',
        options: {
          live: true
        }
      }).then(function () {
        Store = StoreAPIFactory(PouchDB)
      })
    })

    .then(function () {
      return Store.open('db2')
    })

    .then(function (store) {
      return store.add({id: 'bar'})
    })

    .then(function () {
      return new Promise(function (resolve) {
        setTimeout(resolve, 10)
      })
    })

    .then(function () {
      return Store.open('db1')
    })

    .then(function (store) {
      return store.find('bar')
    })

    .then(function (doc) {
      t.ok(doc, 'finds doc in db2 after replication started')
    })

    .then(function () {
      return Store.cancelReplication('db2', 'db1')
    })

    .then(function () {
      return Store.open('db2')
    })

    .then(function (store) {
      return store.add({id: 'baz'})
    })

    .then(function () {
      return Store.open('db1')
    })

    .then(function (store) {
      return store.find('baz')
    })

    .then(function (doc) {
      t.fail('should not find doc in db2 after replication canceled')
    })

    .catch(function (error) {
      t.is(error.status, 404, 'does not find doc in db2 after replication canceled')
    })

    .catch(t.error)
  })

  group.end()
})
