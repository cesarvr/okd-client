const _ = require('lodash')
const client = require('./client')
const builder = require('./builder')

function get_token(hash) {
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
    let url = `${cluster}/oauth/authorize?response_type=token&client_id=openshift-challenging-client`

    rest.headers(headers)
    rest.config({url, strictSSL})
    return rest.done()
               .then(( {resp} ) => resp.request.uri.hash)
               .then(get_token)
               .then(token => builder(cluster, token))
}

module.exports = login
