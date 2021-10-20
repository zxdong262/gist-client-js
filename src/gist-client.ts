// based on tyler's work: https://github.com/tylerlong/ringcentral-js-concise
import axios, { AxiosInstance } from 'axios'
import { Config, Data } from './types'

const version = process.env.version
const apiServer = 'https://api.github.com'

export class HTTPError extends Error {
  status: number
  statusText: string
  data: Data
  config: Config
  constructor (status: number, statusText: string, data: Data, config: Config) {
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
  token: string
  server: string
  _axios: AxiosInstance
  userAgentHeader: string
  constructor (
    token: string,
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

  request (config: Config) {
    const uri = config.url.startsWith('http')
      ? config.url
      : this.server + config.url
    return this._axios.request({
      ...config,
      url: uri.toString(),
      headers: this._patchHeaders(config.headers)
    })
  }

  get (url: string, config = {}) {
    return this.request({ ...config, method: 'get', url })
  }

  delete (url: string, config = {}) {
    return this.request({ ...config, method: 'delete', url })
  }

  post (url: string, data: Data | undefined = undefined, config = {}) {
    return this.request({ ...config, method: 'post', url, data })
  }

  put (url: string, data: Data | undefined = undefined, config = {}) {
    return this.request({ ...config, method: 'put', url, data })
  }

  patch (url: string, data: Data | undefined = undefined, config = {}) {
    return this.request({ ...config, method: 'patch', url, data })
  }

  create (data: Data, conf: Config | undefined) {
    return this.post('/gists', data, conf)
  }

  update (gistId: string, data: Data, conf: Config | undefined) {
    return this.patch(`/gists/${gistId}`, data, conf)
  }

  getOne (gistId: string, conf: Config | undefined) {
    return this.get(`/gists/${gistId}`, conf)
  }

  delOne (gistId: string, conf: Config | undefined) {
    return this.delete(`/gists/${gistId}`, conf)
  }

  _patchHeaders (headers: Data) {
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
