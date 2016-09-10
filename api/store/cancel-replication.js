module.exports = cancelReplication

var toReplicationId = require('../utils/to-replication-id')

function cancelReplication (state, source, target, options) {
  var id = toReplicationId(source, target, options)

  state.replicationsReady

  .then(function () {
    var replication = state.replicationsMap[id]

    if (!replication) {
      return
    }

    state.metaDb.get(id)

    .then(function (doc) {
      doc._deleted = true
      return state.metaDb.put(doc)
    })

    .then(function () {
      delete state.replicationsMap[id]
      replication.cancel()
    })
  })
}
