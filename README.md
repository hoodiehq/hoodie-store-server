# THIS IS WORK IN PROGRESS

# hoodie-server-store

> CouchDB APIs for storing JSON data and sync

[![Build Status](https://travis-ci.org/hoodiehq/hoodie-server-store.svg?branch=master)](https://travis-ci.org/hoodiehq/hoodie-server-store)
[![Dependency Status](https://david-dm.org/hoodiehq/hoodie-server-store.svg)](https://david-dm.org/hoodiehq/hoodie-server-store)

## Install

```
npm install --save hoodie-server-store
```

## Example

```js
var Hapi = require('hapi')
var hapiStore = require('hoodie-server-store')

var server = new Hapi.Server()

server.register({
  register: hapiStore,
  options: {
    couchdb: 'http://localhost:5984'
  }
}, function (error) {
  if (error) throw error
})

server.connection({
  port: 8000
})
server.start(function () {
  console.log('Server running at %s', server.info.uri)
})
```

### options.couchdb (required)

Url to CouchDB

```js
options: {
  couchdb: 'http://localhost:5984'
}
```

### options.prefix

String with which to prefix routes.

```js
options: {
  prefix: '/my-store'
}
```

### options.hooks

Route lifecycle hooks, see http://hapijs.com/api#request-lifecycle


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

## Local setup & tests

```bash
git clone git@github.com:hoodiehq/hoodie-server-store.git
cd hoodie-server-store
npm install
npm test
```

To start the [local dev server](bin/server), run

```
npm start
```

## License

MIT
