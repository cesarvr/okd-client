var assert = require('chai').assert
var Store  = require('../lib/store')
var tmpl   = require('../lib2/template')
var endpoints = require('../lib2/endpoints')
var client = require('../lib2/client')


describe('Testing the API', function () {

    it('testing template loader', function () {
        assert.isFunction(tmpl.load, 'should be a function')
        assert.isObject(tmpl.load('js-one', './tmpl/build.yml'), 'should be a object')

        let build = tmpl.load('js-one','./tmpl/build.yml')
        assert.deepInclude(build.val(), 
            { kind: 'BuildConfig' },
            ' should include a field {kind: \'BuildConfig\' }')

        let sample1 = { 
            apiVersion: 'build.openshift.io/v1'
        }

        assert.deepInclude(build.val(), 
            sample1,
            `should include a field ${JSON.stringify(sample1)} `)

        let sample2 = {name: 'js-one'}

        assert.equal(build.val().metadata.name, 
            sample2.name,
            `should include a field ${JSON.stringify(sample2)} `)

    })

    it('testing endpoint generation', () => {
        assert.isObject(endpoints, 'should be a object')
        assert.isFunction(endpoints.svc, 'should be a function')
        let url = 'https://goo.gl:8443/api/v1/namespaces/hello/services'
        assert.equal(endpoints.svc('goo.gl:8443', 'hello'),url , `should generate a URL ${url}`)

        assert.equal(endpoints.svc('https://goo.gl:8443', 'hello'),url , `should generate a URL ${url}`)
    })

    it('Testing the client', () => {
        let smpl1 =  {
            headers: 
            { 
                Authorization: 'Bearer 3232323232323322',
                Accept: 'application/json',
                'Content-Type': 'application/json' 
            },
            url: 'www.goo.gl', 
            strictSSL: true
        } 

        assert.isFunction(client, 'should be an object')

        let cli = client()
        cli.token('3232323232323322')
        cli.config({url: 'www.goo.gl', strictSSL: true})
        assert.deepEqual(smpl1, cli.values(), 'should be the same.')
    })

})
