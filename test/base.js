let assert = require('chai').assert
let Store = require('../lib/store')
let okd = require('../lib/okd').okd('toookkeeenn')
let login = require('../lib/okd').login

let store = new Store()

describe('Testing connection with OKD', function () {
    it('Trying to make a call without namespace should throw', () => {
        okd.namespace(null)
        assert.throws(() => okd.deploy.by_name('sleep'), 'Error: No namespace was defined.');
    })

    it('Testing Proper namespace initialization', () => {
        okd.namespace('my-namespace')
        assert.equal('my-namespace', okd.ns, 'should be equals to my-namespace')
    })

    it('Instantiating OKD', ()=>{

    	login(store.configuration)
        .then(api => { 
        	assert.isNotNull(api, "we should get the API")
        	console.log('api->', api)
    	})
    })

})

