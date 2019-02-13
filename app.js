
const Store = require('./lib/store')
const login = require('./lib/okd').login

const store = new Store()



login(store.configuration)
    .then(okd => {
        okd.namespace('hello')
        okd.config((conf) => store.save(conf))
        return okd.deploy.put('test', {spec: { replicas: 4 }})
    })
    .then(ok => console.log('update->', ok))
//.then(rs.bind(null, 'fibonacci'))
//.then(rss => console.log('->', rss))
//.then(pods.bind(null, 'micro-x'))
//.then(logs)
    .catch(err => console.log('failing: ', err))
