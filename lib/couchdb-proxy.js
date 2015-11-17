var Joi = require('joi')

module.exports = function (server, options, next) {
  if (!options.couchdb) return next(new TypeError('options.couchdb must be set'))

  server.route({
    method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    path: '/{path*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: function (request, next) {
          var path = request.params.path || ''
          var queryString = request.url.search || ''
          var location = typeof options.couchdb === 'string'
            ? options.couchdb
            : options.couchdb.location
          next(null, location + '/' + path + queryString)
        }
      }
    },
    config: {
      validate: {
        params: {
          path: Joi.string().regex(/^[a-zA-Z]/, 'database must start with character')
        }
      },
      ext: {
      }
    }
  })

  next()
}

module.exports.attributes = {
  name: 'couchdb-store-proxy',
  dependencies: 'h2o2'
}
