let assert = require('chai').assert
let Store  = require('../../lib/store')
let okd    = require('../../lib/okd')

let store  = new Store()
let client = null
let rs = null

const DEPLOY_NAME = 'testing-dc'

before(function() {
    this.timeout(20000)

    let deployment_cfg = {
        name: DEPLOY_NAME,
        replicas: 3,
        image:'busybox'
    }

    return okd(store.configuration)
        .then(api => {
            client = api;

            /*creating objects*/
            client.namespace('hello')
            rs = api.namespace('hello').rs

            let dc = client
                .from_template(deployment_cfg, './tmpl/deploy.yml')
                .post()

            return dc.then(ok => {
                return new Promise((rs, rj) => {
                    setTimeout(()=>{
                        console.log(' ')
                        rs()
                    }, 10000)
                })
            })
        })
        .catch((err) =>  console.log('Failing in Before: ', err ))
})

after(function (){
    return client.namespace('hello').dc.remove(DEPLOY_NAME)
                 .then(rmv => console.log('removed->', rmv) ) 
})

describe('Testing Deployment functionality', function () {
    it('testing get_pods', () => {
        let dc = client.namespace('hello').dc
        let deploy = client.namespace('hello').deploy

        assert.isObject(dc, 'should be an object')
        assert.isObject(deploy, 'should be an object')
        assert.isFunction(deploy.get_pods, 'should exist Deploy object' )
        assert.isFunction(dc.get_pods, 'should exist in DeploymentConfig object' )
    })

    it(`retrive pods from deployment ${DEPLOY_NAME}`, () => {
        return client.namespace('hello').dc.get_pods(DEPLOY_NAME).then(pods => {
            assert.isAtLeast(3, pods.length, 'We need 3 replicas here')
        })
    })

    it(`checking replica-sets`, () => {
        return rs.all().then( rs =>  console.log('rs ->', JSON.stringify(rs,null,4 )) )
    })
})
