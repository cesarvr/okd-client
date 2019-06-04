
const ENDPOINTS = [
    {
      endpoint: 'https://ENDPOINT/apis/build.openshift.io/v1/namespaces/NAMESPACE/buildconfigs',
      name: 'bc',
      document: 'BuildConfig'
    },
    {
      endpoint: 'https://ENDPOINT/apis/image.openshift.io/v1/namespaces/NAMESPACE/imagestreams',
      name: 'is',
      document: 'ImageStream'
    },
    {
      endpoint: 'https://ENDPOINT/apis/apps.openshift.io/v1/namespaces/NAMESPACE/deploymentconfigs',
      name: 'dc',
      document: 'DeploymentConfig'
    }]


module.exports = ENDPOINTS 
