const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')

function containers(deployment) {
    return deployment.metadata.labels
}

function isThisPodFromHere(label, pod){
    let podLabels = pod.metadata.labels
    let labelNames = Object.keys(label)

    let matches = labelNames.find(name => podLabels[name] === label[name] )

    return !_.isEmpty(matches)
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

function filtering_continaers_by_label(lbl, {items}){
    let keys = Object.keys(lbl)
    
    let ret = keys.map(key => items.filter(item => {         
        return item.metadata.labels[key] === lbl[key] 
    }))

    return ret
}



function getLabels(Deployment, obj, name){
    return Deployment.by_name(name)
                     .then(containers)
                     .then(label => {
                      
                     return label
           })
}

function get_resources(Deployment, obj){
    return function(name){
        return Deployment.by_name(name)
                         .then(containers)
                         .then(label => {
                      
                            return obj.pod.all().then(containers => filtering_continaers_by_label(label, containers))
                         })
    }
}

function watch_pods(deployment, api, eventType){
    return function(name, callback) {
        callback = callback || _.identity
        getLabels(deployment, api, name).then( label => {
            api.pod.watch_all(events => { 

                let belongingPods = events.map(event => _.clone({belong: isThisPodFromHere(label, event.object), event }))
                                          .filter(event => event.belong === true)

                belongingPods.filter(pod => pod.event.type === eventType)
                             .forEach( p => callback({ event: p.event.type, pod:p.event.object }))
            
                if(_.isUndefined(eventType))
                    belongingPods.forEach(p => callback({ event: p.event.type, pod:p.event.object }) )
            })
        })
    }
}

const trackNewPod = (deployment, api) => {
    return (name, callback) => {
        let ignoreFirst = 0 
        watch_pods(deployment, api, 'ADDED')(name, (evt) => {

            if(evt.pod.status.phase !== 'Pending')
                return
                 
            let podName = evt.pod.metadata.name
            
            api.pod.watch(podName, callback)
        })
    }
}

function decorate(object, okd_api) {
    object.pod.watch = watch_pods(object, okd_api)
    object.pod.onNew =  watch_pods(object, okd_api, 'ADDED')
    object.pod.trackNewPod =  trackNewPod(object, okd_api)
   
    object.containers = get_resources(object, okd_api)
    object.get_pods = get_pods(okd_api)

    return object
}


function extend(okd_api) {
    okd_api = okd_api || {}
    let deploy = okd_api['deploy'] 
    let dc = okd_api['dc']

    deploy.pod = {}
    dc.pod = {}

    deploy = decorate(deploy, okd_api)
    dc     = decorate(dc, okd_api)
}

module.exports = extend
