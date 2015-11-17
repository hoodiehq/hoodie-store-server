module.exports = normaliseOptions

function normaliseOptions (options) {
  if (!options.couchdb) {
    throw new TypeError('options.couchdb must be set')
  }

  return options
}
