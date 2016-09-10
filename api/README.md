[back to hoodie-store-server](../README.md)

# hoodie-store-server/api

> Store API to manage databases and data.

After registering the `@hoodie/store-server` hapi plugin, the `Store` API becomes available at `server.plugins.store.api`, so for example to create a new database with a plugin, use `server.plugins.store.api.create('mydb')` It can also be required directly.

## Example

```js
var PouchDB = require('pouchdb')
var Store = require('@hoodie/store-server/api')(PouchDB)

Store.open('mydb')

.then(function (store) {
  store.findAll().then(function (docs) {})
})
```

## API

- [Factory](#factory)
- [Store.open](#storeopen)
- [Store.create()](#storecreate)
- [Store.exists()](#storeexists)
- [Store.destroy()](#storedestroy)
- [Store.grant()](#storegrant)
- [Store.revoke()](#storerevoke)
- [Store.hasAccess()](#storehasaccess)
- [Store.replicate()](#storereplicate)
- [Store.cancelReplication()](#storecancelreplication)
- [Instance](#instance)
- [Events](#events)

### Factory

```js
var StoreFactory = require('@hoodie/store-server/api')
var PouchDB = require('pouchdb')
var Store = StoreFactory(PouchDB)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>PouchDB</code></th>
    <td>PouchDB Constructor</td>
    <td>
      PouchDB constructor as returned by <code>require('pouchdb')</code>.
      Note that you can set defaults to a PouchDB constructor using <a href="https://pouchdb.com/api.html#defaults">PouchDB.defaults(options)</a>
    </td>
    <td>Yes</td>
  </tr>
</table>

Returns `Store.*` API. See below

### Store.open()

```js
Store.open(name)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database. Based on PouchDB’s configuration, databases will be
      persisted in CouchDB, using LevelDB, in memory or using a custom adapter.
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves with [`Store` instance](#instance).

Rejects with

<table>
  <tr>
    <th align="left"><code>Missing</code> Error</th>
    <td><code>404</code></td>
    <td>Store does not exist</td>
  </tr>
</table>

```js
Store.open('mydb')
  .then(function (store) {
    // use Hoodie’s store API
  })
  .catch(function (error) {
    if (error.status === 404) {
      console.log('Store "mydb" does not exist')
    } else {
      console.log('Something unexpected happened:', error)
    }
  })
```

### Store.exists()

```js
Store.exists(name)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves with `true` / `false` depending on whether database exists or not.

Example

```js
Store.exists('foo')
  .then(function (doesExist) {
    if (doesExist) {
      console.log('Database "foo" exists');
    } else {
      console.log('Database "foo" does not exists');
    }
  })
  .catch(function (error) {
    console.log('Something unexpected happened:', error)
  })
```

### Store.create()

Creates a database

```js
Store.create(name, options)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.access</code></th>
    <td>String, Array</td>
    <td>
      Can be <code>'read'</code>, <code>'write'</code> or <code>['read', 'write']</code>.
    </td>
    <td>No</td>
  </tr>
  <tr>
    <th align="left"><code>options.role</code></th>
    <td>String, Array</td>
    <td>
      Give access to one or multiple roles. Can only be passed if <options>options.access</options> is set.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `name`.

Rejects with:

<table>
  <tr>
    <th align="left"><code>Conflict</code> Error</th>
    <td><code>409</code></td>
    <td>Store already exist</td>
  </tr>
</table>

Example

```js
Store.create('mydb')
  .then(function (dbName) {
    console.log('Database %s created', dbName)
  })
  .catch(function (error) {
    if (error.status === 409) {
      console.log('Database %s already exists', dbName)
    } else {
      console.log('Something unexpected happened:', error)
    }
  })
```

### Store.destroy()

Deletes a database

```js
Store.destroy(name)
```

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
</table>

Resolves with `name`.

Rejects with:

<table>
  <tr>
    <th align="left"><code>Missing</code> Error</th>
    <td><code>404</code></td>
    <td>Store does not exist</td>
  </tr>
</table>

Example

```js
Store.destroy('mydb')
  .then(function (dbName) {
    console.log('Store "mydb" has been destroyed')
  })
  .catch(function (error) {
    if (error.status === 404) {
      console.log('Store "mydb" does not exist')
    } else {
      console.log('Something unexpected happened:', error)
    }
  })
```

### Store.grant()

```js
Store.grant(dbName, options)
```

Every store is private by default. Read and write access must be granted
explicitly. A store can be set to public read / write, or read / write
access can be granted to specific roles only.

Behaviors in detail:

- Once access was granted to a role it can no longer be public read / write.
- Once access was granted to `'public'`, all other roles will be removed
- Granting access to an existing role has no effect

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.access</code></th>
    <td>String, Array</td>
    <td>
      Can be <code>'read'</code>, <code>'write'</code> or <code>['read', 'write']</code>.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.role</code></th>
    <td>String, Array</td>
    <td>
      Give access to one or multiple roles.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves without arguments. Rejects with

<table>
  <tr>
    <th align="left"><code>Missing</code> Error</th>
    <td><code>404</code></td>
    <td>Store does not exist</td>
  </tr>
</table>

Example

```js
Store.grant('foo', {
  access: 'read'
})
  .then(function () {
    console.log('"foo" can now be read by everyone');
  })
  .catch(function (error) {
    console.log('Something unexpected happened:', error)
  })
```


### Store.revoke()

```js
Store.revoke(dbName, options)
```

Revoke read / write access entirely or from one / multiple roles.

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.access</code></th>
    <td>String, Array</td>
    <td>
      Can be <code>'read'</code>, <code>'write'</code> or <code>['read', 'write']</code>.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.role</code></th>
    <td>String, Array</td>
    <td>
      Revoke access from one or multiple roles.
    </td>
    <td>No</td>
  </tr>
</table>

Resolves without arguments. Rejects with

<table>
  <tr>
    <th align="left"><code>Missing</code> Error</th>
    <td><code>404</code></td>
    <td>Store does not exist</td>
  </tr>
</table>

Example

```js
Store.revoke('foo', {
  access: 'read'
})
  .then(function () {
    console.log('"foo" can no longer be read by anyone');
  })
  .catch(function (error) {
    console.log('Something unexpected happened:', error)
  })
```

### Store.hasAccess()

```js
Store.hasAccess(dbName, options)
```

Checks if the given role has access to given database.

<table>
  <thead>
    <tr>
      <th>Argument</th>
      <th>Type</th>
      <th>Description</th>
      <th>Required</th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>name</code></th>
    <td>String</td>
    <td>
      Name of database.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.access</code></th>
    <td>String, Array</td>
    <td>
      Can be <code>'read'</code>, <code>'write'</code> or <code>['read', 'write']</code>.
      If array passed, checks for access for both.
    </td>
    <td>Yes</td>
  </tr>
  <tr>
    <th align="left"><code>options.role</code></th>
    <td>String, Array</td>
    <td>
      If Array passed, checks if <em>any</em> of the roles has access
    </td>
    <td>No</td>
  </tr>
</table>

Resolves with `true` / `false` depending on whether database exists or not.

Example

```js
Store.hasAccess('foo', {
  access: 'read'
})
  .then(function (hasAccess) {
    if (hasAccess) {
      console.log('"foo" can be read by everyone');
    } else {
      console.log('"foo" cannot be read by everyone');
    }
  })
  .catch(function (error) {
    console.log('Something unexpected happened:', error)
  })
```

### Store.replicate

**Important:** Make sure you have the [pouchdb-replication](http://npm.im/pouchdb-replication) package installed

```js
Store.replicate(source, target, options)
```

Options are the same as [PouchDB.replication](https://pouchdb.com/api.html#replication). The only difference is that replications with `{live: true}` will be persisted and resumed. Because of that, Store.replicate does not return a replication instance, but a Promise which resolves with a replication instance.

### Store.cancelReplication

```js
Store.cancelReplication(source, target)
```

Cancels a live replication removes it from the store so it will no longer be resumed. Returns a promise.

### Instance

A Store instance has the [Hoodie Store API](https://github.com/hoodiehq/pouchdb-hoodie-api#api) (as returned by `db.hoodieApi()`).
To get a Store instance call [`Store.open`](#storeopen)

```js
// all methods return promises
store.add(object)
store.add([object1, id2])
store.find(id)
store.find(object) // with id property
store.findOrAdd(id, object)
store.findOrAdd(object)
store.findOrAdd([object1, id2])
store.findAll()
store.findAll(filterFunction)
store.update(id, changedProperties)
store.update(id, updateFunction)
store.update(object)
store.update([object1, id2])
store.updateOrAdd(id, object)
store.updateOrAdd(object)
store.updateOrAdd([object1, id2])
store.updateAll(changedProperties)
store.updateAll(updateFunction)
store.remove(id)
store.remove(object)
store.remove([object1, id2])
store.removeAll()
store.removeAll(filterFunction)
store.clear()

// events
store.on('add', function(object, options) {})
store.on('update', function(object, options) {})
store.on('remove', function(object, options) {})
store.on('change', function(eventName, object, options) {})
store.on('clear', function() {})
store.one(eventName, eventHandlerFunction)
store.off(eventName, eventHandlerFunction)

// original PouchDB (http://pouchdb.com/api.html) instance used for the store
store.db
```

### Events

<table>
  <thead>
    <tr>
      <th align="left">
        Event
      </th>
      <th align="left">
        Description
      </th>
      <th align="left">
        Arguments
      </th>
    </tr>
  </thead>
  <tr>
    <th align="left"><code>create</code></th>
    <td>New store created successfully</td>
    <td><code>name</code></td>
  </tr>
  <tr>
    <th align="left"><code>destroy</code></th>
    <td>Existing store destroyed</td>
    <td><code>name</code></td>
  </tr>
</table>

## How things work

[PouchDB](https://pouchdb.com) only implements APIs on a database level without
any kind of access control. In order to keep track of all databases, access
settings and replications, we create a meta database `hoodie-store`. Every
database that gets created using `Store.create()` will also create a document
in `hoodie-store` with `_id` being `db_<db name>`. All continuous replications
are stored with as`replication_<source db name>_<target db name>`.

The database documents have an `access` property which we use for access control
on database level.

The replication documents are stored with `source`, `target` and `options`
properties. On server start continuous replications are started for all
replication documents.

### Note on CouchDB

CouchDB has built-in access security features. We take advantage
of these features in case data is stored in a CouchDB

1. We set the `/_security` on database to prevent unwanted read access
2. We use a combination of `/_security` and a custom design doc to prevent
   unwanted write access.

Note that CouchDB has no built-in support for write-only databases. In that case
we set security so the database can be accessed by CouchDB admins only
