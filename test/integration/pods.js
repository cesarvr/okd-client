let assert = require('chai').assert
let Store = require('../../lib/store')
let okd = require('../../lib/okd')

let store = new Store()
const DEPLOY_NAME = 'testing-dc' 

before(function() {
    this.timeout(20000)
    return okd(store.configuration)
        .then(api => {
            okd = api;
            /*creating objects*/
            okd.namespace('hello')
            let dc = okd.from_template({ 
                    name: DEPLOY_NAME, 
                    replicas: 3, 
                    image:'busybox' 
                    }, './tmpl/deploy.yml')
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
    //return okd.namespace('hello').dc.remove(DEPLOY_NAME)
})

describe('Testing Pod functionality', function () {
    it('testing get_pods', () => {
        let dc = okd.namespace('hello').dc
        let deploy = okd.namespace('hello').deploy

        assert.isObject(dc, 'should be an object')
        assert.isObject(deploy, 'should be an object')
        assert.isFunction(deploy.get_pods, 'should exist Deploy object' )
        assert.isFunction(dc.get_pods, 'should exist in DeploymentConfig object' )
    })


    it(`retrive pods from deployment ${DEPLOY_NAME}`, () => {
        return okd.namespace('hello').dc.get_pods(DEPLOY_NAME).then(pods => {
            return okd.pod
        })
    })

})
