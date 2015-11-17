var Hapi = require('hapi')
var H2o2 = require('h2o2')
var nock = require('nock')
var test = require('tap').test

var plugin = require('../')

var noop = function () {}

function provisionServer () {
  var server = new Hapi.Server()
  server.connection()
  server.register(H2o2, noop)
  return server
}

test('options.couchdb is required', function (t) {
  t.plan(2)

  var server = provisionServer()
  server.register(plugin, {}, function (error) {
    t.ok(error instanceof TypeError, 'register fails with TypeError')
    t.is(error.message, 'options.couchdb must be set', 'register fails with error message')
  })
})

test('proxies request to options.couchdb', function (t) {
  t.plan(1)

  var mock = nock('http://example.com')
    .get('/foo')
    .reply(200, {ok: true})

  var server = provisionServer()
  server.register({
    register: plugin,
    options: {
      couchdb: 'http://example.com'
    }
  }, noop)

  server.inject('/foo', function (response) {
    t.ok(mock.isDone(), 'request proxied to http://example.com/foo')
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
