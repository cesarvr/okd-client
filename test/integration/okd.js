let assert = require('chai').assert
let Store = require('../../lib/store')
let okd = require('../../lib/okd')

let store = new Store()
let token = null
let { cluster } = store.configuration

let token_expired = require('./token-expired')
console.log('token-> ', token_expired)

describe('Login into OpenShift', function () {
    it('testing get_pods', () => {
        return okd(store.configuration)
            .then(api => api.namespace('hello'))
            .then(api => {
                api.namespace('hello')
                let { is } = api

                assert.isObject(api, 'should be an object')
                assert.isObject(is, 'should be an object')
                is.all().then(list => assert.equal('ImageStreamList', list.kind, 'We expect a Imagestream.'))
                token = api.get_config().token
                assert.isOk(token, 'we should get a token')
            })
            .catch((err) =>  console.log('Failing in Before: ', err ))
    })

    it('Using OKD with token', ()=> {
        okd({token, cluster})
            .then(api => 
                api.namespace('hello'))
                .then(( {is} ) => {
                    is.all().then(list => assert.equal('ImageStreamList', list.kind, 'We expect a Imagestream.'))
                })
    })
})
