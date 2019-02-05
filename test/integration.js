var assert = require('chai').assert
var Store = require('../lib/store')
var login = require('../lib/okd').login
var fs = require('fs')
var WK = require('../lib/workspace')

let store = new Store()
let okd = null
let workspace = new WK()

const noErrors = (err) =>
{
  assert.isNull(err, `We expect no errors here ${JSON.stringify(err)}`)
}

before(function() {
return login(store.configuration)
        .then(api => {
            okd = api;
        })
        .catch(noErrors)
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
                            .from_template('micro-1', './tmpl/build.yml')

        assert.isFunction(bc.binary, 'bc should have a binary function')
    })


    it.skip('creating deployment config', () => {
        let okd = okd.namespace('hello')
        let dc  = okd.from_template('micro-1', './tmpl/deploy.yml')
        let s = { kind: 'DeploymentConfig'}
        return dc.create().then( (ok) => {
            assert.deepInclude(ok, s, 'should be the the same object')
        }).catch(noErrors)

    })

    it('image stream must contain watch', function () {

        let is = okd.namespace('hello').is
        assert.isDefined(is.watch, 'watch should be defined')
    })

    it('create deployment', ()=> {
        okd =    okd.namespace('hello')
        let deploy = okd.from_template('micro-1', './tmpl/kube-deploy.yml')

        assert.isFunction(deploy.get_name, 'should be defined' )

        deploy.set_name('my-deployment')
        assert.equal( deploy.get_name(),'my-deployment' , 'should be defined' )
        assert.equal( deploy.get_replicas(),1 , 'should have a value of 1' )
        deploy.set_replicas(3)
        assert.equal( deploy.get_replicas(), 3, 'should have a value of 3' )


        deploy.set_replicas(1)
        return deploy.create().then(ok => {
            assert.deepInclude(ok,{kind: 'Deployment'}, 'we expect this by of kind Deployment')
        }).catch(noErrors)
    })

    it('delete deployment', ()=> {
        let deploy = okd.namespace('hello').deploy

        return deploy.remove('my-deployment').then(ok => {
            assert.deepInclude(ok,{kind: 'Deployment'}, 'we expect this by of kind Deployment')
        })
    })

    it('watching a build', function (done) {
      this.timeout(40000)
      okd.namespace('hello')
      let file = workspace.compress('./tt.tar')
      let bc = okd.from_template('micro-1', './tmpl/build.yml')
      okd.is.watch('micro-1', (event)=> {
        assert.deepInclude(event.object, {kind: 'ImageStream'}, 'should watch for buildconfiguration')
        assert.containsAllKeys(event, ['type', 'object'], 'should contain an object with fields: [type, object] ')
        if (event.type === 'MODIFIED') {
          done()
        }
      })

      bc.binary(file, 'micro-1')
      .then(ok => true)
      .catch(noErrors)
    })

    it('launching a binary build', function () {
        this.timeout(5000)
        okd.namespace('hello')

        let bc = okd.from_template('micro-1', './tmpl/build.yml')
        assert.isFunction(bc.binary, 'bc should have a binary function')

        let file = workspace.compress('./tt.tar')
        return bc.binary(file).then(ok => {
            let kind = {kind: 'Build'}
            assert.deepInclude(ok, kind,
                'should return okd object from server')
            workspace.clean()
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

    /*it.only('testing user object', function(){
    
        okd.namespace('hello').user.by_name('user').then(usr => {
            console.log('user ->' , usr)
        
        }).catch(noErrors)
    })*/

    it('load templates', function (){
        let svc = okd.namespace('hello').svc
        svc.load('robot-build' , './tmpl/build.yml')
        let ff = {kind: 'BuildConfig'}
        assert.deepInclude(svc._tmpl.val(), ff, `should had ${ff}`)
    })

})
