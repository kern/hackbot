/**
 * A thin wrapper around Facebook's Graph API that uses ES6 Promises.
 * @module
 */

var Promise = require('es6-promise').Promise
var Qs = require('qs')
var _ = require('underscore')
var request = require('request')

/**
 * The base URL for all Graph API requests.
 * @constant {string}
 */
var baseURL = 'https://graph.facebook.com/v2.3/'

/**
 * Returns the Graph API URL for a query.
 * @param {string} path
 * @param {Object=} params
 * @return {string}
 */
function urlFor(path, params) {
  queryString = Qs.stringify(params || {})
  return baseURL + path + '?' + queryString
}

/**
 * Makes a request to the Graph API.
 * @param {string} accessToken
 * @param {string} method
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
function graphRequest(accessToken, method, path, params) {
  params = _.extend({}, params, { access_token: accessToken })

  return new Promise(function (resolve, reject) {
    request({
      method: method,
      uri: urlFor(path, params),
      json: true
    }, function (err, res, body) {
      if (err) return reject(err)
      if (body.error) return reject(new Error(body.error.message))
      resolve(body)
    })
  })
}

/**
 * A Facebook Graph API client.
 * @class
 * @param {string} accessToken
 */
var FBClient = module.exports = function (accessToken) {

  /** @member {string} */
  this.accessToken = accessToken

}

/**
 * Makes a GET request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
FBClient.prototype.get = function (id, params) {
  return graphRequest(this.accessToken, 'GET', id, params)
}

/**
 * Makes a PUT request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
FBClient.prototype.put = function (id, params) {
  return graphRequest(this.accessToken, 'PUT', id, params)
}

/**
 * Makes a DELETE request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
FBClient.prototype.del = function (id, params) {
  return graphRequest(this.accessToken, 'DELETE', id, params)
}

/**
 * Makes a POST request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
FBClient.prototype.post = function (id, params) {
  return graphRequest(this.accessToken, 'POST', id, params)
}

/**
 * Returns a promise that does nothing and resolves to an empty
 * object. Useful for testing.
 * @return {Promise}
 */
FBClient.prototype.noop = function () {
  return Promise.resolve({})
}
