const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')
const base = require('../base')

function containers(deployment) {
    return deployment.spec.template.spec.containers
}

function filterByDeployment(name) {
    return (pod) => {
      let labels = pod.metadata.labels.deploymentConfig
      return labels === name
    }
}

const get_pods = (obj) => {
  const {cluster, namespace, token } = obj.get_config()

  return (name) => obj.pod
    .all()
    .then( pods => pods.items
      .filter( filterByDeployment(name) ) )
}


function extend(obj) {
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
