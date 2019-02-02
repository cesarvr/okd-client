const _  = require('lodash')
const fs = require('fs')

const endpoints    = require('../endpoints')
const template     = require('../template')
const client = require('../client')

const build_url = (cluster, namespace, is_name) => 
    `${cluster}/apis/image.openshift.io/v1/watch/namespaces/${namespace}/imagestreams/${is_name}?watch=1`

function setup_client(url, token, strictSSL) {
    let cli = client() 
    cli.token( token )
    cli.config({ method: 'GET', url, strictSSL })

    return cli
}

function decorate(is, obj) {
    is.watch = (name, cb) => {
        let is_name = name || is._tmpl.name()

        let cli = obj.config(({
            namespace, 
            cluster, 
            token, 
            strictSSL }) => {
                let url =  build_url(cluster, namespace, is_name)  
                let cli =  setup_client(url, token, strictSSL)
                return cli
            })
        cli.raw(cb)
    }
}

function extend(obj) {
    let is = obj['is']

    if( !_.isUndefined( is ) ) 
        is = decorate(is, obj)
} 

module.exports = extend 
