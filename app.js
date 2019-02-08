
const Store = require('./lib/store')
const login = require('./lib/okd').login

const store = new Store()

function oo() {
     let okd = require('../lib/okd').okd
     let deploy = okd('host','2123')
        .namespace('hello')
        .deploy
        .load({name: 'sleep', image: 'busybox'}, './tmpl/kube-deploy.yml')

      console.log(deploy._tmpl.str())

}

function pods(name, pods) {
    let running = pods
        .items
        .filter(pod =>
            pod.status.phase === 'Running')

    running = running.filter( pod =>
        pod.metadata.labels.app === name )

    return running.map(pod => pod.metadata.name )
}

function rs(name, rsets) {
    let rss = rsets.items.filter(rs => rs.metadata.labels.app === name)
    return rss.map(rs => rs.metadata.name )
}

function logs(podName) {
    const okd = require('./lib/okd')
                    .okd(store.configuration.cluster, store.configuration.token)
                    .namespace('hello')

   
    
    let buffer = '' 
    okd.pod.stream_logs(podName, ok => {
        buffer += ok.toString()

    })
        
    setTimeout(() => console.log('logs->', buffer), 1000)
   /*.then(ok => {
        console.log('======')
        console.log(ok)
        console.log('======')
    })
    .catch(err => console.log('error: ', err))
*/

}

login(store.configuration)
    .then(okd => {
        okd.namespace('hello')
        okd.config((conf) => store.save(conf))
        return okd.pod.all()
    })
    //.then(rs.bind(null, 'fibonacci'))
    //.then(rss => console.log('->', rss))
    .then(pods.bind(null, 'micro-x'))
    .then(logs)
    .catch(err => console.log('failing: ', err))
