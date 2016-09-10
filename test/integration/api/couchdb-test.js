var nock = require('nock')
var PouchDB = require('pouchdb-core')
  .plugin(require('pouchdb-adapter-http'))
var test = require('tap').test

var StoreAPIFactory = require('../../../api')

test('Store', function (group) {
  group.test('Sets /hoodie-store/_security', function (t) {
    t.plan(1)

    var TestPouchDB = PouchDB.defaults({
      prefix: 'http://example.com/'
    })
    var Store = StoreAPIFactory(TestPouchDB)

    var mock = nock('http://example.com/', {'encodedQueryParams': true})
      // check if hoodie-store exists
      .get('/hoodie-store/')
      .reply(200)

      // make sure hoodie-store is secured
      .put('/hoodie-store/_security', {members: {roles: ['_hoodie_admin_only']}})
      .reply(200, {ok: true})

      // check for existing replications to restart
      .get('/hoodie-store/_all_docs')
      .query({include_docs: true, startkey: '%22replication_%22', endkey: '%22replication_%EF%BF%BF%22'})
      .reply(200, {total_rows: 0, offset: 0, rows: []})

      // check if database doc exists in hoodie-store
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(404)

      // create database doc in hoodie-store
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        access: {read: {role: []}, write: {role: []}}
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '1-00'})

      // sanitiy check if database exists
      .get('/couchdb-test-db/')
      .reply(404)

      // create database
      .put('/couchdb-test-db/')
      .reply(201, {ok: true})

      // respond to .info() – makes sure the database is fully setup
      .get('/couchdb-test-db/')
      .reply(200)

      // create security for database – access by admins only by default
      .put('/couchdb-test-db/_security', {
        members: {roles: ['_hoodie_admin_only']}
      })
      .reply(200, {ok: true})

    return Store.create('couchdb-test-db')

    .then(function () {
      // check if all mocks have been consumed, and show the first pending if not
      t.is(mock.pendingMocks()[0], undefined)
    })

    .catch(t.error)
  })

  group.test('works with / in name', function (t) {
    t.plan(1)

    var TestPouchDB = PouchDB.defaults({
      prefix: 'http://example.com/'
    })
    var Store = StoreAPIFactory(TestPouchDB)

    var mock = nock('http://example.com/', {'encodedQueryParams': true})
      // check if hoodie-store exists
      .get('/hoodie-store/')
      .reply(200)

      // make sure hoodie-store is secured
      .put('/hoodie-store/_security', {members: {roles: ['_hoodie_admin_only']}})
      .reply(200, {ok: true})

      // check for existing replications to restart
      .get('/hoodie-store/_all_docs')
      .query({include_docs: true, startkey: '%22replication_%22', endkey: '%22replication_%EF%BF%BF%22'})
      .reply(200, {total_rows: 0, offset: 0, rows: []})

      // check if database doc exists in hoodie-store
      .get('/hoodie-store/db_foo%2Fbar')
      .query({})
      .reply(404)

      // create database doc in hoodie-store
      .put('/hoodie-store/db_foo%2Fbar', {
        _id: 'db_foo/bar',
        access: {read: {role: []}, write: {role: []}}
      })
      .reply(201, {ok: true, id: 'db_foo/bar', rev: '1-000'})

      // sanitiy check if database exiss
      .get('/foo%2Fbar/')
      .reply(404)

      // create database
      .put('/foo%2Fbar/')
      .reply(201, {ok: true})

      // respond to .info() – makes sure the database is fully setup
      .get('/foo%2Fbar/')
      .reply(200)

      // create security for database – access by admins only by default
      .put('/foo%2Fbar/_security', {
        members: {roles: ['_hoodie_admin_only']}
      })
      .reply(200, {ok: true})

    return Store.create('foo/bar')

    .then(function () {
      // check if all mocks have been consumed, and show the first pending if not
      t.is(mock.pendingMocks()[0], undefined)
    })

    .catch(t.error)
  })

  group.test('Store.create sets _security members.read to acme-inc', function (t) {
    t.plan(1)

    var TestPouchDB = PouchDB.defaults({
      prefix: 'http://example.com/'
    })
    var Store = StoreAPIFactory(TestPouchDB)

    var mock = nock('http://example.com/', {'encodedQueryParams': true})
      // check if hoodie-store exists
      .get('/hoodie-store/')
      .reply(200)

      // make sure hoodie-store is secured
      .put('/hoodie-store/_security', {members: {roles: ['_hoodie_admin_only']}})
      .reply(200, {ok: true})

      // check for existing replications to restart
      .get('/hoodie-store/_all_docs')
      .query({include_docs: true, startkey: '%22replication_%22', endkey: '%22replication_%EF%BF%BF%22'})
      .reply(200, {total_rows: 0, offset: 0, rows: []})

      // check if database doc exists in hoodie-store
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(404)

      // create database doc in hoodie-store
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        access: {read: {role: ['acme-inc']}, write: {role: []}}
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '1-000'})

    // sanitiy check if database exiss
      .get('/couchdb-test-db/')
      .reply(404)

      // create database
      .put('/couchdb-test-db/')
      .reply(201, {ok: true})

      // respond to .info() – makes sure the database is fully setup
      .get('/couchdb-test-db/')
      .reply(200)

      // create security for database
      .put('/couchdb-test-db/_security', {
        members: {roles: ['_hoodie_admin_only']}
      })
      .reply(200, {ok: true})

    return Store.create('couchdb-test-db', {
      access: 'read',
      role: 'acme-inc'
    })

    .then(function () {
      // check if all mocks have been consumed, and show the first pending if not
      t.is(mock.pendingMocks()[0], undefined)
    })

    .catch(t.error)
  })

  group.test('_security updates grant/revoke calls', function (t) {
    t.plan(1)

    var mock = nock('http://example.com/', {'encodedQueryParams': true})
      // check if hoodie-store exists
      .get('/hoodie-store/')
      .reply(200)

      // make sure hoodie-store is secured
      .put('/hoodie-store/_security', {members: {roles: ['_hoodie_admin_only']}})
      .reply(200, {ok: true})

      // check for existing replications to restart
      .get('/hoodie-store/_all_docs')
      .query({include_docs: true, startkey: '%22replication_%22', endkey: '%22replication_%EF%BF%BF%22'})
      .reply(200, {total_rows: 0, offset: 0, rows: []})

      // check if database doc exists in hoodie-store
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(404)

      // create database doc in hoodie-store
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        access: {read: {role: []}, write: {role: []}}
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '1-00'})

      // sanitiy check if database exists
      .get('/couchdb-test-db/')
      .reply(404)

      // create database
      .put('/couchdb-test-db/')
      .reply(201, {ok: true})

      // respond to .info() – makes sure the database is fully setup
      .get('/couchdb-test-db/')
      .reply(200)

      // create security for database
      .put('/couchdb-test-db/_security', {
        members: {roles: ['_hoodie_admin_only']}
      })
      .reply(200, {ok: true})

      // grant public read access
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '1-000',
        access: {
          read: {role: []},
          write: {role: []}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '1-000',
        access: {
          read: {role: true},
          write: {role: []}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '2-000'})

      // revoke public read access
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '2-000',
        access: {
          read: {role: true},
          write: {role: []}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '2-000',
        access: {
          read: {role: []},
          write: {role: []}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '3-000'})

      // grant read access to foo
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '3-000',
        access: {
          read: {role: []},
          write: {role: []}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '3-000',
        access: {
          read: {role: ['foo']},
          write: {role: []}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '4-000'})

      // revoke read access to foo
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '4-000',
        access: {
          read: {role: ['foo']},
          write: {role: []}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '4-000',
        access: {
          read: {role: []},
          write: {role: []}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '5-000'})

      // grant write access to bar
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '5-000',
        access: {
          read: {role: []},
          write: {role: []}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '5-000',
        access: {
          read: {role: []},
          write: {role: ['bar']}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '6-000'})

      // grant public read/write
      .get('/hoodie-store/db_couchdb-test-db')
      .query({})
      .reply(200, {
        _id: 'db_couchdb-test-db',
        _rev: '6-000',
        access: {
          read: {role: []},
          write: {role: ['bar']}
        }
      })
      .put('/hoodie-store/db_couchdb-test-db', {
        _id: 'db_couchdb-test-db',
        _rev: '6-000',
        access: {
          read: {role: true},
          write: {role: true}
        }
      })
      .reply(201, {ok: true, id: 'db_couchdb-test-db', rev: '7-000'})

    var TestPouchDB = PouchDB.defaults({
      prefix: 'http://example.com/'
    })
    var Store = StoreAPIFactory(TestPouchDB)

    return Store.create('couchdb-test-db')

    .then(function () {
      return Store.grant('couchdb-test-db', {access: 'read'})
    })

    .then(function () {
      return Store.revoke('couchdb-test-db', {access: 'read'})
    })

    .then(function () {
      return Store.grant('couchdb-test-db', {access: 'read', role: 'foo'})
    })

    .then(function () {
      return Store.revoke('couchdb-test-db', {access: 'read', role: 'foo'})
    })

    .then(function () {
      return Store.grant('couchdb-test-db', {access: 'write', role: 'bar'})
    })

    .then(function () {
      return Store.grant('couchdb-test-db', {access: ['read', 'write']})
    })

    .then(function () {
      // check if all mocks have been consumed, and show the first pending if not
      t.is(mock.pendingMocks()[0], undefined)
    })

    .catch(t.error)
  })

  group.end()
})
