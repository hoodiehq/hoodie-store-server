module.exports = hapiCouchDbStore

hapiCouchDbStore.attributes = {
  name: 'couchdb-store'
}

var url = require('url')

var boom = require('boom')
var hapiToExpress = require('hapi-to-express')

var validDbName = /^[a-zA-Z%]/

function hapiCouchDbStore (server, options, next) {
  var xapp = null
  if (!options.couchdb) {
    xapp = require('express-pouchdb')(options.PouchDB, {
      mode: 'minimumForPouchDB'
    })
    xapp.disable('x-powered-by')
  } else {
    server.register(require('h2o2'))
  }

  if (options.hooks) {
    Object.keys(options.hooks).forEach(function (type) {
      server.ext({
        type: type,
        method: options.hooks[type],
        options: {
          sandbox: 'plugin'
        }
      })
    })
  }

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: handler
  })

  server.route({
    method: ['PUT', 'POST', 'COPY', 'DELETE'],
    path: '/{path*}',
    config: {
      payload: {
        output: 'stream',
        parse: false
      }
    },
    handler: handler
  })

  function handler (request, reply) {
    var rawUrl = request.raw.req.url
    .replace((server.realm.modifiers.route.prefix || '') + '/', '')
    var path = rawUrl.split('/')
    var dbname = path.shift()
    if (!dbname) return reply({couchdb: 'Welcome', ok: true})
    if (!validDbName.test(dbname)) return reply(boom.notFound('database not found'))
    var newUrl = '/' + dbname + '/' + path.join('/')

    if (options.couchdb) {
      return reply.proxy({
        passThrough: true,
        mapUri: function (request, callback) {
          callback(null, url.resolve(options.couchdb, newUrl))
        }
      })
    }

    var hapress = hapiToExpress(request, reply)
    hapress.req.url = newUrl

    xapp(hapress.req, hapress.res)
  }

  next()
}
