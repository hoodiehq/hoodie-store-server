module.exports = setSecurity

var request = require('request').defaults({json: true})

function setSecurity (options) {
  return new Promise(function (resolve, reject) {
    request({
      method: 'put',
      url: options.couchDbUrl + encodeURIComponent(options.dbName) + '/_security',
      body: {
        members: {
          roles: ['_hoodie_admin_only']
        }
      }
    }, function (error, response, data) {
      if (error) {
        return reject(error)
      }

      if (response.statusCode >= 400) {
        return reject(new Error(data.reason))
      }

      resolve()
    })
  })
}
