module.exports = openStore

var errors = require('../utils/errors')
var storeExists = require('./exists')

function openStore (state, name) {
  return storeExists(state, name)

  .then(function (exists) {
    if (!exists) {
      throw errors.MISSING
    }

    return new state.PouchDB(name).hoodieApi()
  })
}
