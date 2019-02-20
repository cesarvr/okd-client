const URLS = {
    bc:      'https://$ENDPOINT/apis/build.openshift.io/v1/namespaces/$NAMESPACE/buildconfigs',
    is:      'https://$ENDPOINT/apis/image.openshift.io/v1/namespaces/$NAMESPACE/imagestreams',
    dc:      'https://$ENDPOINT/apis/apps.openshift.io/v1/namespaces/$NAMESPACE/deploymentconfigs',
    svc:     'https://$ENDPOINT/api/v1/namespaces/$NAMESPACE/services',
    route:   'https://$ENDPOINT/apis/route.openshift.io/v1/namespaces/$NAMESPACE/routes',
    deploy:  'https://$ENDPOINT/apis/apps/v1beta1/namespaces/$NAMESPACE/deployments',
    build:   'https://$ENDPOINT/apis/build.openshift.io/v1/namespaces/$NAMESPACE/builds',
    rs:      'https://$ENDPOINT/apis/extensions/v1beta1/namespaces/$NAMESPACE/replicasets',
    pod:     'https://$ENDPOINT/api/v1/namespaces/$NAMESPACE/pods',
    user:    'https://$ENDPOINT/apis/user.openshift.io/v1/users',
    ns:      'https://$ENDPOINT/api/v1/namespaces',
    project: 'https://$ENDPOINT/apis/project.openshift.io/v1/projects',
}

let supported = {
    'BuildConfig':'bc',
    'DeploymentConfig':'dc',
    'Deployment': 'deploy',
    'ImageStream':'is',
    'Route':'route',
    'Service':'svc',
    'ReplicaSet': 'rs',
    'Router': 'route',
    'Namespace': 'ns',
}

const endpoints = function() {
    let svc = {}

    function fill_placeholders(key) {
        return (cluster, namespace) => {
            let str = URLS[key]
            cluster = cluster.replace('https://', '')
            str = str.replace('$ENDPOINT', cluster)
            str = str.replace('$NAMESPACE', namespace)
            return str
        }
    }

    svc.supported = supported

    Object.keys(URLS).forEach( key => svc[key] = fill_placeholders(key) )
    return svc
}()

module.exports = endpoints
