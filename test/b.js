let assert = require('chai').assert
let InvokeBuilder = require('../lib/invoke')
let endpoint = require('../lib/endpoints')
let RestBuilder = require('../lib/rest')

let cfg    = require('../config.json')

let ivkDeploy = null
let invokeBuilder = null

before(()=> {
    invokeBuilder = new InvokeBuilder(cfg)
  
})

describe('Testing REST', function () {

  it('RESTBuilder should be an object', ()=> {

    assert.isObject(RestBuilder, 'should be an object')
  })

})

