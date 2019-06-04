let assert = require('chai').assert
let cfg    = require('../config.json')
let CoreBuilder  = require('../lib/builders/core')

describe('Core Builder Class', function () {

  it('Instantiation', ()=> {

    let core = new CoreBuilder()
  
    assert.isFunction(CoreBuilder, 'We expect an object')
    assert.isObject(core, 'We expect an object')
   let cli = core.cluster(cfg.cluster) 
        .namespace(cfg.namespace)
        .token(cfg.token)
        .build()

    return cli.bc.all().then(bcs => {
      assert.deepInclude(bcs, {kind:'BuildConfigList'}, 'we should get an BuildConfigList object')
    })

  })


})

