var Joi = require('joi')

module.exports = function (server, options, next) {
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

          // TODO: workaroundkf or https://github.com/hoodiehq/hoodie-server-store/issues/14
          path = path.replace(/^user\//, 'user%2f')

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
