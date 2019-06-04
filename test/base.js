let assert = require('chai').assert
let OKD = require('../lib/okd')
let cfg    = require('../config.json')
let Endpoint  = require('../lib/endpoints')
let okd = null


const  rest_actions = [
  "all", 
  "by_name", 
  "remove", 
  "post", 
  "replace", 
  "put", 
  "patch", 
  "find", 
  "find_all",
  "create",
  "update"
]

describe('Testing OKD', function () {

  it.only('OKD should be an object', ()=> {

    assert.isFunction(OKD, 'should be an constructor')

    okd = new OKD({})

    assert.isObject(okd, 'should be an object')


  })

  it('Trying to make a call without namespace should throw', () => {
    okd.NS(null)
    assert.throws(() => okd.deploy.by_name('sleep'), 'Error: No namespace was defined.');
  })

  it('loading sample templates', () => {

    let deployment_cfg = {
      name: 'testing-dc',
      replicas: 3,
      image:'busybox'
    }

    let deploy = okd.NS('testing-2').loadYML({fields: deployment_cfg, file: './tmpl/deploy.yml'})
    rest_actions.forEach(key => assert.isFunction(deploy[key], `${key} should be a function`))

    return deploy.all().then(list => console.log('list=>', list))
  })

})

