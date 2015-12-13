/**
 * A thin wrapper around Facebook's Graph API that uses ES6 Promises.
 * @module
 */

import Qs from 'qs'
import request from 'request'

/**
 * The base URL for all Graph API requests.
 * @constant {string}
 */
const BASE_URL = 'https://graph.facebook.com/v2.3/'

/**
 * Whether or not dangerous Graph API requests will actually be
 * executed. If true, POST, PUT, and DELETE will be noops.
 * @constant {boolean}
 */
const SIMULATE = false

/**
 * Returns the Graph API URL for a query.
 * @param {string} path
 * @param {Object=} params
 * @return {string}
 */
function urlFor (path, params) {
  const queryString = Qs.stringify(params || {})
  return BASE_URL + path + '?' + queryString
}

/**
 * Makes a request to the Graph API.
 * @param {string} accessToken
 * @param {string} method
 * @param {string} path
 * @param {Object=} params
 * @return {Promise}
 */
function graphRequest (accessToken, method, path, params = {}) {
  params = Object.assign({}, params, { access_token: accessToken })

  return new Promise((resolve, reject) => {
    request({
      method: method,
      uri: urlFor(path, params),
      json: true
    }, (err, res, body) => {
      if (err) { return reject(err) }
      if (body.error) { return reject(new Error(body.error.message)) }
      resolve(body)
    })
  })
}

export default class FBClient {

  /**
   * A Facebook Graph API client.
   * @class
   * @param {string} accessToken
   */
  constructor (accessToken) {
    this.accessToken = accessToken
  }

  /**
   * Makes a GET request to the Graph API.
   * @param {string} path
   * @param {Object=} params
   * @return {Promise}
   */
  get (id, params) {
    return graphRequest(this.accessToken, 'GET', id, params)
  }

  /**
   * Makes a PUT request to the Graph API.
   * @param {string} path
   * @param {Object=} params
   * @return {Promise}
   */
  put (id, params) {
    if (SIMULATE) { return this.noop() }
    return graphRequest(this.accessToken, 'PUT', id, params)
  }

  /**
   * Makes a DELETE request to the Graph API.
   * @param {string} path
   * @param {Object=} params
   * @return {Promise}
   */
  del (id, params) {
    if (SIMULATE) { return this.noop() }
    return graphRequest(this.accessToken, 'DELETE', id, params).catch(x => x)
  }

  /**
   * Makes a POST request to the Graph API.
   * @param {string} path
   * @param {Object=} params
   * @return {Promise}
   */
  post (id, params) {
    if (SIMULATE) { return this.noop() }
    return graphRequest(this.accessToken, 'POST', id, params)
  }

  /**
   * Returns a promise that does nothing and resolves to an empty
   * object. Useful for testing.
   * @return {Promise}
   */
  noop () {
    return Promise.resolve({})
  }

}
