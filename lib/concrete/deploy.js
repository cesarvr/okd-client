const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')
const base = require('../base')

function containers(deployment) {
    return deployment.spec.template.spec.containers
}

function filterByDeployment(name) {
    return (pod) => {
        let labels = pod.metadata.labels
        let match = Object.values(labels).find(value => value === name)
        
        console.log('match->', match, match !== undefined)

        return match !== undefined
    }
}

const get_pods = (obj) => {
    const {cluster, namespace, token } = obj.get_config()

    return (name) => obj.pod
        .all()
        .then( pods => pods.items
            .filter( filterByDeployment(name) ) )
            .then(pods => pods.map(pod => {
                let pod_api = base(cluster, token, {ns: namespace}).pod
                
                Object.keys(pod_api).forEach(fname => {
                   pod_api[fname] =  pod_api[fname].bind(null, pod.metadata.name)
                })

                return pod_api
            }))
}


function extend(obj) {
    obj = obj || {}
    let deploy = obj['deploy']
    let dc = obj['dc']

    deploy.containers = (name) => deploy
      .by_name(name)
      .then(containers)


    deploy.get_pods = get_pods(obj)


    dc.containers = deploy.containers
    dc.get_pods   = deploy.get_pods
}

module.exports = extend
