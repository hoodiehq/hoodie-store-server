# hoodie-store-server

> CouchDB API for data persistence and offline sync

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-store-server.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-store-server)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-store-server/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-store-server?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-store-server.svg)](https://david-dm.org/hoodiehq/hoodie-store-server)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-store-server/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-store-server#info=devDependencies)

`hoodie-store-server` is a [Hapi](http://hapijs.com/) plugin that implements
[CouchDB’s Document API](https://wiki.apache.org/couchdb/HTTP_Document_API).
Compatible with [CouchDB](https://couchdb.apache.org/) and [PouchDB](https://pouchdb.com/)
for persistence.

## Example

```js
var Hapi = require('hapi')
var hapiStore = require('@hoodie/store-server')

var server = new Hapi.Server()

server.connection({
  port: 8000
})

server.register({
  register: hapiStore,
  options: {
    couchdb: 'http://localhost:5984'
  }
}, function (error) {
  if (error) throw error
})


server.start(function () {
  console.log('Server running at %s', server.info.uri)
})
```

## Options

### options.couchdb

Url to CouchDB. _Required unless `options.PouchDB` is set_

```js
options: {
  couchdb: 'http://admin:secret@localhost:5984'
}
// or use a node url object
options: {
  couchdb: url.parse('http://admin:secret@localhost:5984')
}
```

### options.PouchDB

PouchDB constructor. _Required unless `options.couchdb` is set_

```js
options: {
  PouchDB: PouchDB.defaults({
    db: require('memdown')
  })
}
```

### options.hooks

Route lifecycle hooks. _Optional_

```js
options: {
  hooks: {
    onPreResponse: onPreResponseHandler,
    onPreAuth: onPreAuthHandler,
    onPostAuth: onPostAuthHandler,
    onPreHandler: onPreHandlerHandler,
    onPostHandler: onPostHandlerHandler,
    onPreResponse: onPreResponseHandler
  }
}
```

See http://hapijs.com/api#request-lifecycle for more information

## Testing

Local setup

```
git clone https://github.com/hoodiehq/hoodie-store-server.git
cd hoodie-store-server
npm install
```

Run all tests and code style checks

```
npm test
```

## Contributing

Have a look at the Hoodie project's [contribution guidelines](https://github.com/hoodiehq/hoodie/blob/master/CONTRIBUTING.md).
If you want to hang out you can join our [Hoodie Community Chat](http://hood.ie/chat/).

## License

[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)
