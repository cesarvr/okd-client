const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')

function containers(deployment) {
    console.log('dc:', JSON.stringify( deployment, null ,4 ) )
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
        console.log('item => ', item.metadata.labels,  key , lbl)
        return item.metadata.labels[key] === lbl[key] 
    }))

    console.log('ret => ', JSON.stringify(_.flattenDeep(ret), null, 4) )


    return ret
}



function getLabels(Deployment, obj, name){
    return Deployment.by_name(name)
                     .then(containers)
                     .then(label => {
                      console.log('lbl: ', label)
                     return label
           })
}

function get_resources(Deployment, obj){
    return function(name){
        return Deployment.by_name(name)
                         .then(containers)
                         .then(label => {
                            console.log('lbl: ', label)
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

            // We ignore the first ADDED event as this one belongs to the existent running pod.
            // We want to wait for a new one, otherwise we use a simple watch.
            if(ignoreFirst < 1) {
                ignoreFirst++
                return
            }

            let podName = evt.pod.metadata.name
            console.log('tracking pod: ', podName)
            api.pod.watch(podName, callback)
        })
    }
}




function extend(obj) {
    obj = obj || {}
    let deploy = obj['deploy'] 
    let dc = obj['dc']

    deploy.pod = {}
    dc.pod = {}

    deploy.pod.watch = watch_pods(deploy, obj)
    deploy.pod.onNew =  watch_pods(dc, obj, 'ADDED')
    deploy.pod.trackNewPod =  trackNewPod(deploy, obj)

    dc.pod.watch = watch_pods(dc, obj)
    dc.pod.onNew =  watch_pods(dc, obj, 'ADDED')
    dc.pod.trackNewPod =  trackNewPod(dc, obj)



    deploy.containers = get_resources(deploy, obj)
    deploy.get_pods = get_pods(obj)

    dc.containers = get_resources(dc, obj)
    dc.get_pods = deploy.get_pods
}
module.exports = extend
