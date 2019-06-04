let assert = require('chai').assert
let OKD = require('../lib/okd')
let cfg    = require('../config.json')
let Endpoint  = require('../lib/endpoints')

let okd = null
let endpoint = null

before(() => {
  OKD(cfg).then(_okd => {
    okd = _okd
  })
})


describe('Endpoint Class', function () {

  it('Instantiation', ()=> {
  
    endpoint = new Endpoint({cluster: 'MY_CLUSTER', namespace: 'TEST01'}) 
    assert.isFunction(Endpoint, 'We expect an object')
    assert.isObject(endpoint, 'We expect an object')
    assert.isNotNull(endpoint.entries, 'should not be null')
    assert.isArray(endpoint.entries, 'should be an object')
  })


  it('checking endpoint.entriesWithPlaceHolders method', () => {
      endpoint.entriesWithPlaceHolders.forEach(entry => {
        let {alias, URL} = entry
        assert.isDefined( alias, 'alias should be defined')
        assert.include(URL, 'ENDPOINT', 'should contain placeholder')
    })
  })

  it('checking endpoint.entries method', ()=> {
    endpoint.entries.forEach(entry => {
        let {alias, URL} = entry
        assert.isDefined( alias, 'alias should be defined')
        assert.include(URL, 'MY_CLUSTER', 'should contain placeholder')
    })
  })
})

