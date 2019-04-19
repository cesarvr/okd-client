const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')

function filter_pods(pod, name) {
  pod[name.toLowerCase()] = () => pod.all().then(list => list.items.filter(pod => pod.status.phase === name) )
}

function containers(deployment) {
  return deployment.spec.containers
}

function extend(obj) {
    obj = obj || {}
    let pod = obj['pod']

    pod.containers = (name) =>{
        return pod.by_name(name).then(containers)
    }

    filter_pods(pod, 'Running')
    filter_pods(pod, 'Completed')
    filter_pods(pod, 'Pending')
    filter_pods(pod, 'Succeeded')
}

module.exports = extend
