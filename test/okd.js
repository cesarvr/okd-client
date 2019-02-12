var assert = require('chai').assert
var Store  = require('../lib/store')
var tmpl   = require('../lib/template')
var endpoints = require('../lib/endpoints')
var client = require('../lib/client')
var tools = require('../lib/tools')
var okd_stream = require('../lib/helper/okd_stream')()


describe('When data we should extract the JSON and leave the rest', () => {

  it('testing okd_stream parser object', ()=> {
    let p1 = `{"value": "aaaaa"} \n {"value": "bbbbbb"} \n {"value":"ccccc"} \n`

    let ret = okd_stream.read(p1)
    assert.isArray(ret, `it should return an array` )
    assert.equal(ret.length, 3, `it should return an array` )

    ret.forEach(values => {
      assert.isObject(values, 'should be an object')
      assert.isDefined(values.value, 'value should be defined')
    })
  })

  it('testing alternative values', () => {

    let p2 = `{"home": "aaaaa"} \n {"home": "bbbbbb"} \n {"home":"ccccc"} \n`
    let ret = okd_stream.read(p2  )
    ret.forEach(values => {
      assert.isObject(values, 'should be an object')
      assert.isDefined( values.home, 'home should be defined')
    })
  })

  it('testing with incomplete values', () => {
    let p2 = `{"type": "aaaaa"} \n {"type": "bbbbbb"} \n {"type":`
    let ret = okd_stream.read(p2  )
    ret.forEach(values => {
      assert.isObject(values, 'should be an object')
      assert.isDefined(values.type, 'home should be defined')
    })
  })


  it('testing with incomplete data', () => {
    let p2 = `{"type": "aaa:`
    let ret = okd_stream.read(p2  )
    assert.isArray(ret, `it should return an array`)
    assert.isEmpty(ret, `it should be an empty array`)
  })


  it('testing remove readed function', () => {
    let p1 = `{"type": "aaaaa"} \n {"type": "bbbbbb"} \n {"type":`
    assert.isFunction(okd_stream.remove_readed, 'should be a function')

    let ret = okd_stream.remove_readed(p1)
    assert.equal(ret, `{"type":`, `it should return an array` )

  })

})

describe('Testing the API', function () {

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
