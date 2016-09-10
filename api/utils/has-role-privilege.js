module.exports = hasRolePrivilege

var _ = require('lodash')

function hasRolePrivilege (access, role, privilege) {
  if (access[privilege].role === true) {
    return true
  }

  if (role === true) {
    return false
  }

  return _.intersection(access[privilege].role, _.concat(role)).length > 0
}
