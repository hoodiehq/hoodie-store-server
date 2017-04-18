// PR test
module.exports = hapiCouchDbStore

hapiCouchDbStore.attributes = {
  name: 'store'
}

var url = require('url')

var boom = require('boom')
var hapiToExpress = require('@gr2m/hapi-to-express')
var StoreFactory = require('@hoodie/store-server-api')

var toCouchDbUrl = require('./utils/pouchdb-options-to-couchdb-url')

var validDbName = /^[a-z]/ // must begin with a lowercase letter

function hapiCouchDbStore (server, options, next) {
  var api = StoreFactory(options.PouchDB)

  // if connected to a CouchDb, we proxy the requests right through.
  // Otherwise we load express-pouchdb and proxy the request to the express app
  if (api.adapter === 'http') {
    // workaround for https://github.com/pouchdb/pouchdb/issues/5548
    var couchDbUrl = toCouchDbUrl(new options.PouchDB('hack', {skip_setup: true}).__opts)
    server.register({
      register: require('h2o2'),
      once: true
    })
  } else {
    var xapp = require('express-pouchdb')(options.PouchDB, {
      mode: 'minimumForPouchDB'
    })
    xapp.disable('x-powered-by')
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

  server.expose({
    api: api
  })

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
    var rawUrl = request.raw.req.url.replace((server.realm.modifiers.route.prefix || '') + '/', '')
    var path = rawUrl.split('/')
    var dbname = path.shift()

    if (!dbname) {
      return reply({couchdb: 'Welcome', ok: true})
    }
    if (!validDbName.test(dbname)) {
      return reply(boom.notFound('database not found'))
    }

    var newUrl = '/' + dbname + '/' + path.join('/')

    if (api.adapter === 'http') {
      return reply.proxy({
        passThrough: true,
        mapUri: function (request, callback) {
          callback(null, url.resolve(couchDbUrl, newUrl))
        }
      })
    }

    var hapress = hapiToExpress(request, reply)
    hapress.req.url = newUrl

    xapp(hapress.req, hapress.res)
  }

  next()
}
