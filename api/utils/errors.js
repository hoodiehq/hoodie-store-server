module.exports = {}

function hoodieError (options) {
  var error = new Error(options.message)
  error.name = options.name || error.name
  error.status = options.status

  return error
}

module.exports.MISSING = hoodieError({
  name: 'Missing',
  message: 'Store does not exist',
  status: 404
})

module.exports.CONFLICT = hoodieError({
  name: 'Conflict',
  message: 'Store already exists',
  status: 409
})

module.exports.REPLICATION_PACKAGE_MISSING = hoodieError({
  message: 'pouchdb-replication package missing: npm.im/pouchdb-replication',
  status: 500
})
