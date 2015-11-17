module.exports = hapiCouchDbStore
hapiCouchDbStore.attributes = {
  name: 'couchdb-store'
}

var normaliseOptions = require('./lib/normalise-options')

function hapiCouchDbStore (server, options, next) {
  try {
    options = normaliseOptions(options)
  } catch (error) {
    return next(error)
  }
  server.register({
    register: require('./lib/couchdb-proxy'),
    options: options
  }, {
    routes: {
      prefix: options.prefix
    }
  }, next)
}
