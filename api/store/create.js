module.exports = createStore

var pathResolve = require('path').resolve

var _ = require('lodash')
var mkdirp = require('mkdirp')

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
      if (!state.usesHttpAdapter) {
        var db = new state.PouchDB(name)
        return db.info()

        // TODO: remove once https://github.com/pouchdb/pouchdb/issues/5668 is resolved
        // also remove mkdirp from package.json unless it’s used somewhere else
        .catch(function (error) {
          if (error.name === 'OpenError') {
            var path = db.__opts.prefix ? db.__opts.prefix + name : name
            return new Promise(function (resolve, reject) {
              mkdirp(pathResolve(path), function (error) {
                if (error) {
                  return reject(error)
                }

                resolve()
              })
            })

            .then(function () {
              return new state.PouchDB(name).info()
            })
          }
          throw error
        })
      }

      return new state.PouchDB(name).info().then(function () {
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
