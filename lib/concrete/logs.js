const _ = require('lodash')
const {build_url} = require('../tools')
const client = require('../client')

const logs_url = ({cluster, namespace, name}) => 
                 `${cluster}/api/v1/namespaces/${namespace}/pods/${name}/log?pretty=true`

const stream_logs_url = ({cluster, namespace, name}) => 
                 `${cluster}/api/v1/namespaces/${namespace}/pods/${name}/log?follow=true`



function setup_client(url, token, strictSSL) {
    let cli = client()
    cli.token( token )
    cli.config({ method: 'GET', url, strictSSL })

    return cli
}

function extend(obj) {
    obj = obj || {}

    obj['pod'].logs = (name) => {
        let cli = obj.config(({ namespace, cluster, token, strictSSL }) => {
                let url = logs_url({cluster, namespace, name }) 
                let cli =  setup_client(url, token, strictSSL)
                return cli
        })

        return cli.dbg()
                  .done()
                  .then( ( {body} ) => body )
    } 


    obj['pod'].stream_logs = (name, cb) => {
        let cli = obj.config(({ namespace, cluster, token, strictSSL }) => {
                let url = stream_logs_url({cluster, namespace, name }) 
                let cli =  setup_client(url, token, strictSSL)
                return cli
        })

        return cli.dbg().config({
                            timeout: 3600000
                        })
                  .stream(cb)
    }
}

module.exports = extend
