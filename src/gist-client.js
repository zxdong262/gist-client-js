// based on tyler's work: https://github.com/tylerlong/ringcentral-js-concise
import axios from 'axios'

const version = process.env.version
const apiServer = 'https://api.github.com'

class HTTPError extends Error {
  constructor (status, statusText, data, config) {
    super(`status: ${status}
statusText: ${statusText}
data: ${JSON.stringify(data, null, 2)}
config: ${JSON.stringify(config, null, 2)}`)
    this.status = status
    this.statusText = statusText
    this.data = data
    this.config = config
  }
}

class GistClient {
  constructor (
    token,
    userAgentHeader = `github-gist-client-js/v${version}`
  ) {
    this.token = token
    this.server = apiServer
    this.userAgentHeader = userAgentHeader
    this._axios = axios.create()
    const request = this._axios.request.bind(this._axios)
    this._axios.request = (config) => {
      try {
        return request(config)
      } catch (e) {
        if (e.response) {
          throw new HTTPError(e.response.status, e.response.statusText, e.response.data, e.response.config)
        } else {
          throw e
        }
      }
    }
  }

  request (config) {
    const uri = config.url.startsWith('http')
      ? config.url
      : this.server + config.url
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  get (url, config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url, config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url, data = undefined, config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }

  create (data) {
    return this.post('/gists', data)
  }

  update (gistId, data) {
    return this.patch(`/gists/${gistId}`, data)
  }

  getOne (gistId) {
    return this.get(`/gists/${gistId}`)
  }

  delOne (gistId) {
    return this.delete(`/gists/${gistId}`)
  }

  _patchHeaders (headers) {
    return {
      ...this._authHeader(),
      'X-User-Agent': this.userAgentHeader,
      ...headers
    }
  }

  _authHeader () {
    return this.token
      ? {
          Authorization: `token ${this.token}`
        }
      : {}
  }
}

export default GistClient
