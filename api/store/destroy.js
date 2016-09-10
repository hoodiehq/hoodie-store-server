module.exports = destroyStore

var getDocOrFalse = require('../utils/get-doc-or-false')

function destroyStore (state, name) {
  return getDocOrFalse(state.metaDb, name)

  .then(function (doc) {
    if (doc === false) {
      throw new Error(`Database "${name}" does not exist`)
    }

    doc._deleted = true
    return state.metaDb.put(doc)
  })

  .then(function () {
    return new state.PouchDB(name).destroy()
  })

  .then(function () {
    return name
  })
}
