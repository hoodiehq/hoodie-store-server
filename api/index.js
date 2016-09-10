module.exports = StoreAPIFactory

var hoodieApi = require('pouchdb-hoodie-api')
var request = require('request').defaults({json: true})

var create = require('./store/create')
var destroy = require('./store/destroy')
var exists = require('./store/exists')
var open = require('./store/open')

var grantAccess = require('./store/grant')
var hasAccess = require('./store/has-access')
var revokeAccess = require('./store/revoke')

var replicate = require('./store/replicate')
var cancelReplication = require('./store/cancel-replication')

var replicationIdPrefix = require('./utils/to-replication-id').prefix
var toCouchDbUrl = require('./utils/pouchdb-options-to-couchdb-url')

function StoreAPIFactory (PouchDB) {
  if (typeof PouchDB !== 'function') {
    throw new Error('Store API Factory requires PouchDB as first argument')
  }

  // https://github.com/hoodiehq/pouchdb-hoodie-api
  PouchDB.plugin(hoodieApi)

  var metaDb = new PouchDB('hoodie-store')
  var replicationsMap = {}
  var adapter = new PouchDB('hack', {skip_setup: true}).adapter
  var usesHttpAdapter = adapter === 'http' || adapter === 'https'
  var couchDbUrl = toCouchDbUrl(metaDb.__opts)

  var replicationsReady = metaDb.allDocs({
    include_docs: true,
    startkey: replicationIdPrefix,
    endkey: replicationIdPrefix + '\uffff'
  }).then(function (result) {
    return result.rows.forEach(function (row) {
      if (replicationsMap[row.id]) {
        return
      }

      replicationsMap[row.id] = PouchDB.replicate(row.doc.source, row.doc.target, row.doc.options)
    })
  })

  if (usesHttpAdapter) {
    replicationsReady = replicationsReady.then(function () {
      return new Promise(function (resolve, reject) {
        request({
          method: 'put',
          url: couchDbUrl + 'hoodie-store/_security',
          body: {
            members: {
              roles: ['_hoodie_admin_only']
            }
          }
        }, function (error, response, data) {
          if (error) {
            return reject(error)
          }

          if (response.statusCode >= 400) {
            return reject(new Error(data.reason))
          }

          resolve()
        })
      })
    })
  }

  var state = {
    PouchDB: PouchDB,
    metaDb: metaDb,
    couchDbUrl: couchDbUrl,
    usesHttpAdapter: usesHttpAdapter,
    replicationsReady: replicationsReady,
    replicationsMap: replicationsMap
  }
  var Store = {}

  // set adapter to http for both http & https
  Store.adapter = usesHttpAdapter ? 'http' : adapter
  Store.create = create.bind(null, state)
  Store.destroy = destroy.bind(null, state)
  Store.exists = exists.bind(null, state)
  Store.open = open.bind(null, state)
  Store.grant = grantAccess.bind(null, state)
  Store.hasAccess = hasAccess.bind(null, state)
  Store.revoke = revokeAccess.bind(null, state)
  Store.replicate = replicate.bind(null, state)
  Store.cancelReplication = cancelReplication.bind(null, state)

  return Store
}
