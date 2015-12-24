module.exports = hapiCouchDbStore
hapiCouchDbStore.attributes = {
  name: 'couchdb-store'
}

var normaliseOptions = require('./lib/normalise-options')

function hapiCouchDbStore (server, options, next) {
  console.log(1);
  try {
    options = normaliseOptions(options)
  } catch (error) {
    console.log(error);
    return next(error)
  }
  console.log(2);
  try {
    var p = require('./lib/couchdb-proxy')
  } catch(e) {
    console.log(e);
    return next(e)
  }
  server.register({
    register: p,
    options: options
  }, {
    routes: {
      // prefix: options.prefix
    }
  }, next)
  console.log(4);
}
