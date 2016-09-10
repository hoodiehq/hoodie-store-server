module.exports = removeRolePrivilege

var _ = require('lodash')

/**
 * An empty array means that nobody has access. If the current setting is true,
 * access cannot be revoked for a role, so it remains true. Otherwise all passed
 * roles are removed from the once that currently have access
 */
function removeRolePrivilege (access, role, privilege) {
  if (role === true) {
    access[privilege] = {
      role: []
    }
    return
  }

  if (access[privilege].role === true) {
    access[privilege].role = true
  }

  _.pullAll(access[privilege].role, _.concat(role))
}
