module.exports = hapiCouchDbStore
hapiCouchDbStore.attributes = {
  name: 'couchdb-store'
}

function hapiCouchDbStore (server, options, next) {
  server.register({
    register: require('./lib/couchdb-proxy'),
    options: {
      couchdb: options.couchdb,
      hooks: options.hooks
    }
  }, {
    routes: {
      prefix: options.prefix
    }
  }, next)
}
