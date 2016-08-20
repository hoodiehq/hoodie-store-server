# hoodie-store-server

> CouchDB API for data persistence and offline sync

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-store-server.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-store-server)
[![Coverage Status](https://coveralls.io/repos/hoodiehq/hoodie-store-server/badge.svg?branch=master)](https://coveralls.io/r/hoodiehq/hoodie-store-server?branch=master)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-store-server.svg)](https://david-dm.org/hoodiehq/hoodie-store-server)
[![devDependency Status](https://david-dm.org/hoodiehq/hoodie-store-server/dev-status.svg)](https://david-dm.org/hoodiehq/hoodie-store-server#info=devDependencies)

`hoodie-store-server` is a [Hapi](http://hapijs.com/) plugin that implements
[CouchDB’s Document API](https://wiki.apache.org/couchdb/HTTP_Document_API)
and exposes a [JavaScript API](api) to manage databases, access and replications.

## Example

```js
var Hapi = require('hapi')
var hoodieStore = require('@hoodie/store-server')
var PouchDB = require('pouchdb')

var server = new Hapi.Server()

server.connection({
  port: 8000
})

server.register({
  register: hoodieStore,
  options: {
    PouchDB: PouchDB
  }
}, function (error) {
  if (error) throw error
})


server.start(function () {
  console.log('Server running at %s', server.info.uri)
})
```

## Options

### options.PouchDB

PouchDB constructor. _Required_

```js
options: {
  PouchDB: require('pouchdb-core').plugin('pouchdb-adapter-leveldb')
}
```

If you want connect to a CouchDB, use the `pouchdb-adapter-http` and set
`options.prefix` to the CouchDB url. All requests will be proxied to CouchDB
directly, the PouchDB constructor is only used for [server.plugins.store.api](api)

```js
options: {
  PouchDB: require('pouchdb-core')
    .plugin('pouchdb-adapter-http')
    .defaults({
      prefix: 'http://localhost:5984',
      auth: {
        username: 'admin',
        password: 'secret'
      }
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
