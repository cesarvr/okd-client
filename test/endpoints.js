let assert = require('chai').assert
let cfg    = require('../config.json')
let Endpoint  = require('../lib/helper/endpoints')


const ENDPOINTS = [
    {
      endpoint: 'https://ENDPOINT/apis/build.openshift.io/v1/namespaces/NAMESPACE/buildconfigs',
      name: 'bc',
      document: 'BuildConfig'
    },
    {
      endpoint: 'https://ENDPOINT/apis/image.openshift.io/v1/namespaces/NAMESPACE/imagestreams',
      name: 'is',
      document: 'ImageStream'
    },
    {
      endpoint: 'https://ENDPOINT/apis/apps.openshift.io/v1/namespaces/NAMESPACE/deploymentconfigs',
      name: 'dc',
      document: 'DeploymentConfig'
    }]

describe('Endpoint Class', function () {

  it('Instantiation', ()=> {
  
    let endpoint = new Endpoint(ENDPOINTS) 
    assert.isFunction(Endpoint, 'We expect an object')
    assert.isObject(endpoint, 'We expect an object')
  })


  it('Getting URL', ()=> {
  
    let ep = new Endpoint(ENDPOINTS) 

    assert.equal(
      'https://ENDPOINT/apis/build.openshift.io/v1/namespaces/NAMESPACE/buildconfigs', 
      ep.getURL('bc'), 'should match the first URL' )


    assert.isDefined(ep.add, 'We expect an object')

    ep.add('ENDPOINT', 'my-svc:8080')

    assert.equal(
      'https://my-svc:8080/apis/build.openshift.io/v1/namespaces/NAMESPACE/buildconfigs', 
      ep.getURL('bc'), 'should match the first URL' )

  
    ep.add('NAMESPACE', 'testing')

    assert.equal(
      'https://my-svc:8080/apis/build.openshift.io/v1/namespaces/testing/buildconfigs', 
      ep.getURL('bc'), 'should match the first URL' )

   // ep.add('NAMESPACE')

    
    assert.throws(()=> ep.getURL('ss'), 'Error: cannot find ss in endpoint list.', '');
  })

  it('Entries', () => {
    let uris = {method: 'bc', URL: 'https://my-svc:8080/apis/build.openshift.io/v1/namespaces/testing/buildconfigs'} 

    let ep = new Endpoint(ENDPOINTS) 

    ep.add('ENDPOINT', 'my-svc:8080')
    ep.add('NAMESPACE', 'testing')

    assert.deepInclude(ep.entries(), uris ,'should include an URL')
  })

})

