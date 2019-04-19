const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')

function containers(deployment) {
    return deployment.spec.template.spec.containers
}

function filterByDeployment(name) {
    return (pod) => {
        let deployment_label = pod.metadata.labels.deployment
        if(deployment_label === undefined)
            return false

        if(!deployment_label.includes(name))
            return false

        return true
    }
}

const get_pods = (obj) => {
    return (name) => obj.pod
        .all()
        .then( pods => pods.items
            .filter( filterByDeployment(name) ) )
}


function extend(obj) {
    obj = obj || {}
    let deploy = obj['deploy'] 
    let dc = obj['dc']

    deploy.containers = (name) => {
        return deploy.by_name(name)
            .then(containers)
    }

    deploy.get_pods = get_pods(obj)


    dc.containers = deploy.containers
    dc.get_pods = deploy.get_pods
}

module.exports = extend
