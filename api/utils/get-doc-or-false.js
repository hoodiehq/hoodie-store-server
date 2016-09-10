module.exports = getDocOrFalse

var toDbId = require('./to-db-id')

function getDocOrFalse (metaDb, name) {
  return metaDb.get(toDbId(name))

  .catch(function (error) {
    if (error.status === 404) {
      return false
    }

    throw error
  })
}
