const _  = require('lodash')
const fs = require('fs')

const endpoints    = require('../endpoints')
const template     = require('../template')
const client = require('../client')

const build_url = (cluster, namespace, is_name) => 
    `https://192.168.64.2:8443/apis/image.openshift.io/v1/watch/namespaces/hello/imagestreams/micro-1?watch=1`

function setup_client(url, token, strictSSL) {
    let cli = client() 
    cli.token( token )
    cli.config({ method: 'GET', url, strictSSL })

    return cli
}

function decorate(deploy, obj) {
    deploy.get_replicas = () => deploy._tmpl.val().spec.replicas 

    deploy.set_replicas = (r) => deploy._tmpl.val().spec.replicas = r 

}

function extend(obj) {
    let deploy = obj['deploy']

    if( !_.isUndefined( deploy ) ) 
        deploy = decorate(deploy, obj)
} 

module.exports = extend 
