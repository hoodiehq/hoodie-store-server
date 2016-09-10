module.exports = parseRoleOption

function parseRoleOption (options) {
  return options.hasOwnProperty('role') ? options.role : true
}
