var test = require('tap').test
var proxyquire = require('proxyquire').noPreserveCache()
var state = {}

state.PouchDB = function () {
  return {}
}

state.PouchDB.plugin = function () {}

test('Store replicate function', function (group) {
  group.test('Returns a promise rejection when the module is not found', function (t) {
    var replicate = proxyquire('../../../api/store/replicate', {'pouchdb-replication': null})
    t.plan(1)
    replicate(state)
      .then(function () {
        t.fail('Replicate function should not return a fulfilled promise')
        t.end()
      })
      .catch(function (error) {
        t.ok(error, 'Replicate returns rejected promise')
        t.end()
      })
  })
  group.end()
})
