const _ = require('lodash')
const login = require('./login')

function build(configuration) {
  let endpoint_list = new Endpoint(configuration)
  let API = RESTful(client)
}

class OKDClient {
  constructor(config, strictSSL) {
    this.client = RequestWrapper()
                    .token(config.token)
                    .config({ strictSSL })
  }

  setNS(ns){
    this.namespace = ns
    return this
  }
}

class OKDAuthenticate {
  constructor(cluster, namespace){
    this.cluster = cluster
    this.strictSSL = false
  }

  basic({user, password}) {
    let { cluster, strictSSL } = this
    return login({cluster, user, password, strictSSL})
            .then(token  => this.useToken(token))        
  }

  useToken(token){
    return build_api({cluster, token, strictSSL})
  }
}


module.exports = OKDAuthenticate 
