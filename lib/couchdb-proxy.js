var Joi = require('joi')
var url = require('url')

module.exports = function (server, options, next) {
  var couchdb = url.parse(options.usersDb._db_name)
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
        mapUri: function (request, reply) {
          var path = request.params.path || ''
          var queryString = request.url.search || ''
          var username = getUsernameFromRequest(request)
          if (!username) {
            return reply(404)
          }
          getUserDbNameFromUsername(username, options.usersDb, function(error, db_name) {
            if (error) {
              return reply(error)
            }
            var location = [couchdb.protocol, '//', couchdb.host, '/', db_name].join('')
            reply(null, location + '/' + path + queryString)
          })
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

// ** this should be its own module
var base64url = require('base64url')

function decodeSessionId (id) {
  var parts = base64url.decode(id).split(':')
  return {
    name: parts[0],
    time: parseInt(parts[1], 16),
    token: parts[2]
  }
}
// **

function getUsernameFromRequest (request) {
  if (!request.headers['authorization']) {
    return false
  }
  var bearerToken = request.headers['authorization'].substr(7)
  var session = decodeSessionId(bearerToken)
  // treat invalid bearer tokens as 404
  if (session.name.match(/[^a-zA-Z0-9_-]/)) {
    return false
  }
  return session.name
}

function getUserDbNameFromUsername (name, usersDb, callback) {
  // we need to cache this
  return usersDb.get('org.couchdb.user:' + name)
  .then(function(user_doc) {
    var hoodieId = user_doc.roles[0].split(':')[1]
    callback(null, hoodieId)
  })
  .catch(function(error) {
    callback(error)
  })
}
