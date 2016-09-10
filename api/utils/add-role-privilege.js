module.exports = addRolePrivilege

var _ = require('lodash')

/**
 * If setting privilege to true (everyone has access) or
 * if the current setting already is true, then set the privilege to true.
 * Otherwise merge the current and added roles to an array, avoiding duplicates.
 */
function addRolePrivilege (access, role, privilege) {
  if (role === true || access[privilege].role === true) {
    access[privilege] = {
      role: true
    }
    return
  }

  access[privilege].role = _.union(access[privilege].role, _.concat(role))
}
