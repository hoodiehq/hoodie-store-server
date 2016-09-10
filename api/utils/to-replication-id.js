module.exports = toReplicationId

var toId = require('to-id')

toReplicationId.prefix = 'replication_'

function toReplicationId (source, target, options) {
  return toReplicationId.prefix + toId(source) + '_' + toId(target)
}
