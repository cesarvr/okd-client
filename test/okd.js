var assert = require('chai').assert
var Store  = require('../lib/store')
var tmpl   = require('../lib/template')
var endpoints = require('../lib/endpoints')
var client = require('../lib/client')
var tools = require('../lib/tools')
var jreader = require('../lib/helper/json_reader.js')()



describe('Testing the API', function () {

    it('JSON reader', ()=>{
      assert.isFunction(jreader.is_json, 'isJSON should be a function')
      assert.isTrue(jreader.is_json('{}'), '{} this could be transform to a valid json')
      assert.isTrue(jreader.is_json(`{"name": "bob"}`), `{"name": "bob"} this could be transform to a valid json`)
      assert.isFalse(jreader.is_json(`{"name": "bob",`), `{"name": "bob", ... this cannot be transformed to a valid json`)

    })

    it('Testing JSON parsing', ()=>{
      assert.isFunction(jreader.parse_block, 'isJSON should be a function')
      assert.isArray(jreader.parse_block('{"name": "bob"} {"name": "dylan"}'), 'This should return an array')
      assert.equal(jreader.parse_block('{"name": "bob"} {"name": "dylan"}').length, 2,'This should return an array')
      assert.deepEqual(jreader.parse_block('{"name": "bob"} {"name": "dylan"}'), [{name:'bob'}, {name: 'dylan'}],'This should be the same')
    })

    it('Testing partial JSON parsing', ()=>{
      assert.deepEqual(jreader.parse_block('{"name": "bob"} {"name" '), [{name:'bob'}],'This should be the same')
      assert.deepEqual(jreader.parse_block('"name": "bob"} {"name": "dylan"} '), [{name:'dylan'}],'This should be the same')
      assert.deepEqual(jreader.parse_block('"name": "bob"} {"name": "dylan" '), [],'This should be the same')
      assert.deepEqual(jreader.parse_block('{"name": "bob", "second": "dylan"} '), [{name: 'bob', second:'dylan'}],'This should be the same')


    })


    it('checking tools.count', ()=>{
        assert.isFunction(tools.count, 'should be a function')

        assert.deepEqual(tools.count('{{{', ['{']), {'{':3}, 'should be the same'  )
        assert.deepEqual(tools.count('{{{}}{{', ['{']), {'{':5}, 'should be the same'  )
        assert.deepEqual(tools.count('{{{}}{{}', ['{', '}']), {'{':5, '}':3}, 'should be the same'  )
        assert.deepEqual(tools.count('{', ['{', '}']), {'{':1, '}':0}, 'should be the same'  )
        assert.deepEqual(tools.count('', ['{', '}']), {'{':0, '}':0}, 'should be the same'  )
    })

    it('checking that watch() function exist', () => {
        let {okd} = require('../lib/okd')

        okd = okd('127.0.0.1', 'token')

        assert.isFunction(okd.is.watch, 'imagestream should have a watch function')
        assert.isFunction(okd.dc.watch, 'dc should have a watch function')
        assert.isFunction(okd.svc.watch, 'service should have a watch function')
        assert.isFunction(okd.deploy.watch, 'deploy should have a watch function')


    })

    it('testing template loader', function () {
        assert.isFunction(tmpl.load, 'should be a function')
        assert.isObject(tmpl.load({name: 'js-one'}, './tmpl/build.yml'), 'should be a object')

        let build = tmpl.load({name: 'js-one'},'./tmpl/build.yml')
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
                Accept: 'application/json'
            },
            url: 'www.goo.gl',
            strictSSL: true,
            timeout: 5000,
        }

        assert.isFunction(client, 'should be an object')

        let cli = client()
        cli.token('3232323232323322')
        cli.config({url: 'www.goo.gl', strictSSL: true})
        assert.deepEqual(smpl1, cli.values(), 'should be the same.')
    })

})
