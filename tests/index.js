var Hapi = require('hapi')
var h2o2 = require('h2o2')
var nock = require('nock')
var PouchDB = require('pouchdb')
var request = require('request').defaults({json: true})
var test = require('tap').test

var plugin = require('../')

var noop = function () {}

function provisionServer () {
  var server = new Hapi.Server()
  server.connection({port: 12345})
  server.register(h2o2, noop)
  return server
}

test('proxies request to options.couchdb', function (t) {
  t.plan(1)

  var mock = nock('http://example.com')
    .get('/foo/')
    .reply(200, {ok: true})

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      couchdb: 'http://example.com'
    }
  }, noop)

  server.inject('/foo', function (response) {
    t.ok(mock.isDone(), 'request proxied to http://example.com/foo/')
  })
})

test('proxies request to options.pouchdb', function (t) {
  t.plan(4)

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      PouchDB: PouchDB.defaults({
        db: require('memdown')
      })
    }
  }, noop)

  t.tearDown(server.stop.bind(server, null))

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

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      couchdb: {
        location: 'http://example.com'
      },
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
