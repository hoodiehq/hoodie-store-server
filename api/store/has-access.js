module.exports = hasAccess

var _ = require('lodash')

var getRoleOption = require('../utils/get-role-option')
var hasRolePrivilege = require('../utils/has-role-privilege')
var toDbId = require('../utils/to-db-id')

function hasAccess (state, name, options) {
  return state.metaDb.get(toDbId(name))

  .then(function (doc) {
    var privileges = _.concat(options.access)
    return privileges.filter(function (privilege) {
      return hasRolePrivilege(doc.access, getRoleOption(options), privilege)
    }).length === privileges.length
  })
}
