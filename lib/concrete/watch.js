const _ = require('lodash')
const {build_url} = require('../tools')
const client = require('../client')


const WATCH_URLS = {
    bc:     'https://$ENDPOINT/apis/build.openshift.io/v1/watch/namespaces/$NAMESPACE/buildconfigs',
    is:     'https://$ENDPOINT/apis/image.openshift.io/v1/watch/namespaces/$NAMESPACE/imagestreams',
    dc:     'https://$ENDPOINT/apis/apps.openshift.io/v1/watch/namespaces/$NAMESPACE/deploymentconfigs',
    svc:    'https://$ENDPOINT/api/v1/watch/namespaces/$NAMESPACE/services',
    route:  'https://$ENDPOINT/apis/route.openshift.io/v1/watch/namespaces/$NAMESPACE/routes',
    deploy: 'https://$ENDPOINT/apis/apps/v1beta1/watch/namespaces/$NAMESPACE/deployments',
    build:  'https://$ENDPOINT/apis/build.openshift.io/v1/watch/namespaces/$NAMESPACE/builds',
}



function setup_client(url, token, strictSSL) {
    let cli = client()
    cli.token( token )
    cli.config({ method: 'GET', url, strictSSL })

    return cli
}

function make_watch(tmpl_url, obj) {
    return (target, cb) => {
        let cli = obj.config(({ namespace, cluster, token, strictSSL }) => {
                let url =  tmpl_url(cluster, namespace)
                let cli =  setup_client(url, token, strictSSL)
                return cli
        })

        return cli.target(target).raw(cb)
    }
}


function make_watch_all(tmpl_url, obj) {
    return (cb) => {
        let cli = obj.config(({ namespace, cluster, token, strictSSL }) => {
                let url =  tmpl_url(cluster, namespace)
                let cli =  setup_client(url, token, strictSSL)
                return cli
        })

        return cli.stream(data => cb(data) )
    }
}


function extend(obj) {
    obj = obj || {}

    Object.keys(WATCH_URLS).forEach(key => {
        let url = build_url(key, WATCH_URLS)
        obj[key].watch = make_watch(url, obj)
        obj[key].watch_all = make_watch_all(url, obj)
    })

}

module.exports = extend
