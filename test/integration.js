var assert = require('chai').assert
var Store = require('../lib/store')
var okd = require('../lib2/okd')
var fs = require('fs')
var WK = require('../lib/workspace')

let store = new Store()
okd_builder = null 

const noErrors = (err) => 
{ 
    console.log('fuck this!!!', err)
    assert.isNull(err, `We expect no errors here ${JSON.stringify(err)}`) } 

before(function() {
 return okd(store.configuration)
        .then(okdb => okd_builder = okdb)
        .catch(noErrors)
})


function delay() { 
    return new Promise( (resolve, reject) => {
                      setTimeout(() => resolve('ok'), 5000)
               }) 
}
describe('Testing connection with OKD', function () {


    it('connecting to okd', function () {
        return okd(store.configuration)
               .then(okd_builder => {
                   assert.isDefined(okd_builder , 'should be defined')
                   assert.isObject(okd_builder, 'Instance of builder');
                   okd_builder = okd_builder
               })
               then(delay)
               .catch(noErrors)
    })

    it('testing extentions mechanism', function () {
        let bc = okd_builder.namespace('hello')
                            .from_template('micro-1', './tmpl/build.yml')

        assert.isFunction(bc.binary, 'bc should have a binary function') 
    })

    it('testing okd.exist', function () {
        let bc = okd_builder.namespace('hello')
                            .from_template('micro-1', './tmpl/build.yml')

        bc.exist(ok =>  assert.isTrue(ok, 'should exist') )
          .catch(noErrors)
    })

    it('making a build okd', function () {
        let bc = okd_builder.namespace('hello')
                            .from_template('micro-1', './tmpl/build.yml')

        bc.exist(ok => { 
            if(!ok) 
                bc.post();

            return ok } )
          .then(delay)
          .catch(noErrors)
    })

    it('launching a binary build', function () {
        

        let bc = okd_builder.namespace('hello')
                            .from_template('micro-1', './tmpl/build.yml')

        assert.isFunction(bc.binary, 'bc should have a binary function') 
        bc.binary('../okd.tar.gz') 
    })



    it('testing find all components', function (){
        let svc = okd_builder.namespace('hello').svc
        return svc.all()
            .then(list => { 
                let ff = {kind: 'ServiceList'} 
                assert.deepInclude(list, ff, `should had ${ff}`)
            }).catch(err=> console.err(err))

    })


    it('testing by_name retrieval', function (){
        let svc = okd_builder.namespace('hello').svc
        return svc.by_name('toby')
            .then(list => { 
                let ff = {kind: 'Service'} 
                assert.deepInclude(list, ff, `should had ${ff}`)
            })
            .catch(noErrors)
    })

    it('load templates', function (){
        let svc = okd_builder.namespace('hello').svc
        svc.template('robot-build' , './tmpl/build.yml')
        let ff = {kind: 'BuildConfig'} 
        assert.deepInclude(svc._tmpl.val(), ff, `should had ${ff}`)
    })



})



