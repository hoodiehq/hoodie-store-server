var Hapi = require('hapi')
var h2o2 = require('h2o2')
var nock = require('nock')
var PouchDB = require('pouchdb-core')
var request = require('request').defaults({json: true})
var test = require('tap').test

var plugin = require('../../')

var noop = function () {}

function provisionServer () {
  var server = new Hapi.Server()
  server.connection({port: 12345})
  server.register(h2o2, noop)
  return server
}

test('proxies request to CouchDB', function (t) {
  var mock = nock('http://example.com')
    .get('/hoodie-store/')
    .reply(200, {db_name: 'hoodie-store'})
    .put('/hoodie-store/_security')
    .reply(201)
    .get('/hoodie-store/_all_docs')
    .query({
      include_docs: true,
      startkey: '"replication_"',
      endkey: '"replication_\uffff"'
    })
    .reply(200, {rows: []})
    .get('/foo/')
    .reply(200, {db_name: 'foo'})

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      PouchDB: PouchDB
        .plugin(require('pouchdb-adapter-http'))
        .defaults({
          prefix: 'http://example.com/'
        })
    }
  }, noop)

  server.inject('/foo', function (response) {
    // mock.pendingMocks() might still not be fulfilled as bootstrapping
    // is happening in the background
    mock.pendingMocks().forEach(function (route) {
      t.isNot(route, 'GET http://example.com:80/foo/')
    })

    t.end()
  })
})

test('proxies request to PouchDB', function (t) {
  t.plan(4)

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      PouchDB: PouchDB.plugin(require('pouchdb-adapter-memory'))
    }
  }, noop)

  server.start(function () {
    request.get('http://127.0.0.1:12345/foo', function (err, res, data) {
      t.error(err, 'error')
      t.equal(res.statusCode, 404, 'correct statusCode')
      server.stop()
    })
    request.get('http://127.0.0.1:12345/', function (err, res, data) {
      t.error(err, 'error')
      t.equal(res.statusCode, 200, 'correct statusCode')
    })
  })
})

test('adds basic auth header', function (t) {
  t.plan(1)

  nock('http://example.com')
    .get('/hoodie-store/')
    .reply(200, {db_name: 'hoodie-store'})
    .put('/hoodie-store/_security')
    .reply(201)
    .get('/hoodie-store/_all_docs')
    .query({
      include_docs: true,
      startkey: '"replication_"',
      endkey: '"replication_\uffff"'
    })
    .reply(200, {rows: []})
    .get('/foo/')
    .reply(200, {ok: true})

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      PouchDB: PouchDB
        .plugin(require('pouchdb-adapter-http'))
        .defaults({
          prefix: 'http://example.com/'
        }),
      hooks: {
        onPreAuth: function (request, next) {
          request.headers.authorization = 'Basic chek12'
          next()
        }
      }
    }
  }, noop)

  server.inject('/foo', function (response) {
    t.is(response.request.headers.authorization, 'Basic chek12', 'sets Authorization header')
  })
})
