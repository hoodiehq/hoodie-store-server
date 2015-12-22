module.exports = normaliseOptions

function normaliseOptions (options) {
  if (!options.usersDb) {
    throw new TypeError('options.usersDb must be set')
  }

  return options
}
