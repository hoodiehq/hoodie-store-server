module.exports = createStore

var _ = require('lodash')

var addRolePrivilege = require('../utils/add-role-privilege')
var errors = require('../utils/errors')
var getRoleOption = require('../utils/get-role-option')
var setSecurity = require('../utils/couchdb-set-security')
var storeExists = require('./exists')
var toDbId = require('../utils/to-db-id')

function createStore (state, name, options) {
  return storeExists(state, name)

  .then(function (doesExist) {
    if (doesExist) {
      throw errors.CONFLICT
    }

    var doc = {
      _id: toDbId(name),
      access: {
        read: {
          role: []
        },
        write: {
          role: []
        }
      }
    }

    if (options) {
      _.concat(options.access).forEach(function (privilege) {
        addRolePrivilege(doc.access, getRoleOption(options), privilege)
      })
    }

    return state.metaDb.put(doc)

    .then(function () {
      var db = new state.PouchDB(name)
      if (!state.usesHttpAdapter) {
        return db.info()
      }

      return db.info().then(function () {
        var options = {
          couchDbUrl: state.couchDbUrl,
          dbName: name
        }
        return setSecurity(options)
      })
    })
  })

  .then(function () {
    return name
  })
}
