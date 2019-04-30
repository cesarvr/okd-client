let assert = require('chai').assert
let Store = require('../../lib/store')
let okd_object = require('../../lib/object')

let pod = null

describe.skip('Testing OKDObjects', function () {
    it('Testing Instantiation', () => {
       assert.isFunction(okd_object, 'should be a function')
    })

    it('Testing Proper namespace initialization', () => {
        okd.namespace('my-namespace')
        assert.equal('my-namespace', okd.ns, 'should be equals to my-namespace')
    })
})

