const Endpoint   = require('../helper/endpoints')
const client = require('../helper/client')
const RESTful = require('../helper/rest')
const ENDPOINTS = require('./core_endpoints')

class CoreBuilder {
  constructor() {
    this.client = client()
      .config({ strictSSL:false })

    this.endpoint = new Endpoint(ENDPOINTS)
  }

  token(token) {
    this.client.token(token)
    return this
  }

  strictSSL(ssl) {
    this.client.config({ strictSSL:ssl })
    return this
  }

  cluster(cluster) {
    this.endpoint.add('ENDPOINT', cluster.replace('https://',''))
    return this
  }

  namespace(ns){
    this.endpoint.add('NAMESPACE', ns)
    return this
  }

  build() {
    let entries = this.endpoint.entries()
    const restCtor = RESTful(this.client)

    let core = entries.reduce((acc, next) => {
      let {method, URL} = next 
      acc[method] = restCtor(URL) 
      return acc
    }, {})

    return core
  }
}

module.exports = CoreBuilder 
