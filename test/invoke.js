let assert = require('chai').assert
let InvokeBuilder = require('../lib/invoke')
let endpoint = require('../lib/endpoints')
let cfg    = require('../config.json')

let ivkDeploy = null
let invokeBuilder = null

describe('Testing InvokeFactory', function() {

  it('Testing creation using InvokeFactory', ()=> {

    invokeBuilder = new InvokeBuilder(cfg)
    assert.isObject(invokeBuilder, 'should be an object')

    let deploy = endpoint['dc'](cfg.cluster, 'testing-2')

    ivkDeploy = invokeBuilder
        .setEndpoint(deploy)
        .setMethod('GET')
        .build()

    assert.isObject(ivkDeploy, 'should be an object')
  })

  it('Testing OKD API Invocation', ()=> {
    return ivkDeploy.call(  ).then(body => assert.equal(body.kind, 'DeploymentConfigList', 'should be equals'))
  })

  it('Create another invokation', ()=> {
    let deploy = endpoint['pod'](cfg.cluster, 'testing-2')
    let ivk2 = invokeBuilder.setEndpoint(deploy)
        .setMethod('GET')
        .build()

    return ivk2.call().then(body => assert.equal(body.kind, 'PodList', 'should be equals'))
  })




})
