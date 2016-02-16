var Hapi = require('hapi')
var PouchDB = require('pouchdb')

var server = new Hapi.Server()

server.connection({
  port: 3000
})

server.register({
  register: require('./'),
  options: {
    PouchDB: PouchDB.defaults({
      db: require('memdown')
    })
    // couchdb: 'http://admin:secret@localhost:5984'
  }
}, function (err) {
  if (err) return console.log(err)
  server.start(function () {
    console.log('Server running at:', server.info.uri)
  })
})
