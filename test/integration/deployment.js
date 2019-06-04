let assert = require('chai').assert
let okd    = require('../../lib/okd')
let cfg    = require('../../../config.json')
const { delay1000 } = require('./helper')

let client = null
let rs = null
const NS = 'testing-2'
const DEPLOY_NAME = 'testing-dc'

before(function() {
    this.timeout(20000)

    let deployment_cfg = {
        name: DEPLOY_NAME,
        replicas: 3,
        image:'busybox'
    }

    return okd(cfg)
        .then(api => {
            client = api;

            /*creating objects*/
            let dc = client.NS(NS).dc

            let dc = client
                .from_template(deployment_cfg, './tmpl/deploy.yml')
                .post()

            return dc.then(delay1000())
        })
        .catch((err) =>  console.log('Failing in Before: ', err ))
})

/*
after(function (){
    return client.dc.remove(DEPLOY_NAME)
                 .then(rmv => console.log('removed->', rmv) ) 
})
*/

describe('Testing Deployment functionality', function () {
    it('testing get_pods', () => {
        let dc = client.dc
        let deploy = client.deploy

        assert.isObject(dc, 'should be an object')
        assert.isObject(deploy, 'should be an object')
        assert.isFunction(deploy.get_pods, 'should exist Deploy object' )
        assert.isFunction(dc.get_pods, 'should exist in DeploymentConfig object' )
    })

    it(`retrive pods from deployment ${DEPLOY_NAME}`, () => {
        return client.dc.get_pods(DEPLOY_NAME).then(pods => {
            assert.isAtLeast(3, pods.length, 'We need 3 replicas here')
        })
    })
})
