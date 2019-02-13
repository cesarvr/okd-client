var assert = require('chai').assert
var Store = require('../lib/store')
var login = require('../lib/okd').login
var fs = require('fs')
var WK = require('../lib/workspace')

let store = new Store()
let okd = null
let workspace = new WK()
let file = null

const noErrors = (err) =>
{
  assert.isNull(err, `We expect no errors here ${JSON.stringify(err)}`)
}

before(function() {
file = workspace.compress('./tt.tar')
return login(store.configuration)
        .then(api => {
            okd = api;
        })
        .catch(noErrors)
})

after(() => {
   workspace.clean()

    /*
    let bc = okd.namespace('hello').bc
    return bc.remove({name: 'micro-1'})
    .then(ok => {
        console.log('remove->', ok)
    })
    .catch(noErrors)*/
})

describe('Testing connection with OKD', function () {
    it('testing login', function () {
        return login(store.configuration)
               .then(okd_builder => {
                   assert.isDefined(okd , 'should be defined')
                   assert.isObject(okd, 'Instance of builder');
                   okd = okd
               })
               .catch(noErrors)
    })

    it('testing extentions mechanism', function () {
        let bc = okd.namespace('hello')
                            .from_template({ name: 'micro-1' }, './tmpl/build.yml')

        assert.isFunction(bc.binary, 'bc should have a binary function')
    })
 this.timeout(150000);
    it('testing errors', () => {

        var _okd = require('../lib/okd').okd
        _okd = _okd('https://120.3.3.3:8443', 'NOTOKEN').namespace('wrong')
        return _okd.pod.all().then(ok => {
            console.log('ok->', ok)

        }).catch(err => {
            assert.hasAnyKeys(err, ['code', 'payload', 'message'])
            assert.equal(err.code, 'ETIMEDOUT', 'it should be a timeout')
        })

    })


    it.skip('creating deployment config', () => {
        let okd = okd.namespace('hello')
        let dc  = okd.from_template({name: 'micro-1'}, './tmpl/deploy.yml')
        let s = { kind: 'DeploymentConfig'}
        return dc.create().then( (ok) => {
            assert.deepInclude(ok, s, 'should be the the same object')
        }).catch(noErrors)

    })

    it('image stream must contain watch', function () {

        let is = okd.namespace('hello').is
        assert.isDefined(is.watch, 'watch should be defined')
    })

    /*
    it('create a build', () => {
        okd.namespace('hello')
        let bc = okd.from_template('wicro-x', './tmpl/build.yml')

        return bc.post()
        .then(ok => {
            console.log('create bc-> ', ok)
        })
        .catch(noErrors)
    })*/



    it('watching a build', function (done) {
      this.timeout(40000)
      okd.namespace('hello')
      let bc = okd.from_template({name: 'micro-x'}, './tmpl/build.yml')
      okd.is.watch('micro-x', (event)=> {
        assert.deepInclude(event.object, {kind: 'ImageStream'}, 'should watch for buildconfiguration')
        assert.containsAllKeys(event, ['type', 'object'], 'should contain an object with fields: [type, object] ')
        if (event.type === 'MODIFIED') {
          done()
        }
      })

      bc.binary(file, 'micro-x')
      .then(ok => true)
      .catch((err) => console.log('err0r ->', err) )
    })


    it('launching a binary build', function () {
        this.timeout(25000)
        okd.namespace('hello')

        let bc = okd.from_template({name: 'micro-x'}, './tmpl/build.yml')
        assert.isFunction(bc.binary, 'bc should have a binary function')

        return bc.binary(file).then(ok => {
            let kind = {kind: 'Build'}
            assert.deepInclude(ok, kind,
                'should return okd object from server')
        }).catch(noErrors)
    })

    it('get builds', ()=> {
        okd.namespace('hello')
        return okd.namespace('hello')
                  .bc
                  .by_name('micro-x').then(ok => {
            }).catch(noErrors)
    })

    it('testing find all components', function (){
        let svc = okd.namespace('hello').svc
        return svc.all()
            .then(list => {
                let ff = {kind: 'ServiceList'}
                assert.deepInclude(list, ff, `should had ${ff}`)
            }).catch(err=> console.err(err))
    })


    it('testing by_name retrieval', function (){
        let svc = okd.namespace('hello').svc
        return svc.by_name('toby')
            .then(list => {
                let ff = {kind: 'Service'}
                assert.deepInclude(list, ff, `should had ${ff}`)
            })
            .catch(noErrors)
    })

    it('load templates', function (){
        let svc = okd.namespace('hello').svc
        svc.load({name: 'robot-build' } , './tmpl/build.yml')
        let ff = {kind: 'BuildConfig'}
        assert.deepInclude(svc._tmpl.val(), ff, `should had ${ff}`)
    })

})
