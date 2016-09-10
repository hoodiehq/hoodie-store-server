module.exports = replicate

var toReplicationId = require('../utils/to-replication-id')
var errors = require('../utils/errors')

function replicate (state, source, target, options) {
  if (!options) {
    options = {}
  }

  // load PouchDB replication plugin as needed
  if (!state.PouchDB.replicate) {
    try {
      state.PouchDB.plugin(require('pouchdb-replication'))
    } catch (error) {
      if (error.message === 'Cannot find module \'pouchdb-replication\'') {
        return Promise.reject(errors.REPLICATION_PACKAGE_MISSING)
      }

      throw error
    }
  }

  if (!options.live) {
    var replication = state.PouchDB.replicate(source, target, options)

    return Promise.resolve({
      replication: replication
    })
  }

  var id = toReplicationId(source, target, options)

  return state.metaDb.put({
    _id: id,
    source: source,
    target: target,
    options: options
  })

  .then(function (doc) {
    var replication = state.PouchDB.replicate(source, target, options)

    state.replicationsMap[id] = replication

    return {
      replication: replication
    }
  })
}
