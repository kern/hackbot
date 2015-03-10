/**
 * A thin wrapper around Facebook's Graph API that uses ES6 Promises.
 * @module
 */

var Promise = require('es6-promise').Promise;
var Qs = require('qs');
var _ = require('underscore');
var request = require('request');

/**
 * The default query string parameters for each Graph API request.
 * @constant {Object}
 */
var defaultParams = { access_token: process.env.ACCESS_TOKEN };

/**
 * The base URL for all Graph API requests.
 * @constant {string}
 */
var baseURL = 'https://graph.facebook.com/v2.2/';

/**
 * Returns the Graph API URL for a query.
 * @param {string} path
 * @param {Object=} params
 * @return {string}
 */
function urlFor(path, params) {
  var query = _.extend({}, defaultParams, params || {});
  queryString = Qs.stringify(query);
  return baseURL + path + '?' + queryString;
}

/**
 * Makes a request to the Graph API.
 * @param {string} method
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
function graphRequest(method, path, params) {
  return new Promise(function (resolve, reject) {
    request({
      method: method,
      uri: urlFor(path, params),
      json: true
    }, function (err, res, body) {
      if (err) return reject(err);
      if (body.error) return reject(new Error(body.error));
      resolve(body);
    });
  });
}

/**
 * Makes a GET request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
exports.get = function (id, params) {
  return graphRequest('GET', id, params);
};

/**
 * Makes a PUT request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
exports.put = function (id, params) {
  return graphRequest('PUT', id, params);
};

/**
 * Makes a DELETE request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
exports.del = function (id, params) {
  return graphRequest('DELETE', id, params);
};

/**
 * Makes a POST request to the Graph API.
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
exports.post = function (id, params) {
  return graphRequest('POST', id, params);
};

/**
 * Returns a promise that does nothing and resolves to an empty
 * object. Useful for testing.
 * @return {Promise}
 */
exports.noop = function () {
  return Promise.resolve({});
};
