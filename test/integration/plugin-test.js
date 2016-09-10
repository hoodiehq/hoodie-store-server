var PouchDB = require('pouchdb-core').plugin(require('pouchdb-adapter-memory'))
var Hapi = require('hapi')
var test = require('tap').test

var hapiStore = require('../../')

test('plugin', function (t) {
  var server = new Hapi.Server()

  server.connection({
    port: 1234
  })

  server.register({
    register: hapiStore,
    options: {
      PouchDB: PouchDB
    }
  }, function (error) {
    if (error) throw error

    t.ok(server.plugins.store.api, 'api exposed at server.plugins.store.api')
    t.is(typeof server.plugins.store.api, 'object', 'server.plugins.store.api')

    t.end()
  })
})
