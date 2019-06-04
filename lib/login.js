const _ = require('lodash')
const client = require('./client')
const {cluster_address} = require('./tools')

function check_status({ resp }) {
    if(resp.statusCode === 400)
        throw { reason: 'Authentication failiure: Bad Request HTTP_400', status: resp.statusCode }

    if(resp.statusCode === 401)
        throw { reason: 'Authentication failiure: Bad Credentials',  status: resp.statusCode }
   
    return resp
}

function get_token(resp) {
      let hash = resp.request.uri.hash
      if (_.isEmpty(hash)) throw `Failing to get token. from response ${JSON.stringify(resp, undefined, 4)}`
      const startIndex = hash.indexOf('=') + 1
      const stopIndex = hash.indexOf('&')
      return hash.slice(startIndex, stopIndex)
}

function credentials(user, password) {
    let credentials = `${user}:${password}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
}

function login({cluster, user, password, strictSSL}) {
    let rest = client()
    let headers = {
        'X-CSRF-Token': 1,
        'Authorization': credentials(user, password)
    }

    let _cluster = cluster_address(cluster)
    let url      = `${_cluster}/oauth/authorize?response_type=token&client_id=openshift-challenging-client`

    rest.headers(headers)
    rest.config({ url, strictSSL })

    return rest.done()
               .then( check_status )
               .then(get_token)
}


module.exports = login 
