let assert = require('chai').assert
let Store = require('../lib/store')
let login = require('../lib/okd').login
let fs = require('fs')
let WK = require('../lib/workspace')

let store = new Store()
let okd = null
let workspace = new WK()
let file = null

const noErrors = (err) =>
{
    assert.isNull(err, `We expect no errors here ${JSON.stringify(err)}`)
}

before(function() {
    this.timeout(5000)
    file = workspace.compress('./tt.tar')
    return login(store.configuration)
        .then(api => {
            okd = api;

            /*creating objects*/
            okd.namespace('hello')
            let bc = okd.from_template({ name: 'micro-x' }, './tmpl/build.yml')
            let is = okd.from_template({ name: 'micro-x' }, './tmpl/imagestream.yml')

            let create = [bc, is].map(oo => oo.post())
            return Promise.all(create)
                .then(ok => console.log('#'))
        })
        .catch(noErrors)
})

after(() => {
    workspace.clean()
})

describe('Testing connection with OKD', function () {

    it('testing login', function () {
        return login(store.configuration)
            .then(okd_builder => {
                assert.isDefined(okd_builder, 'should be defined')
                assert.isObject(okd_builder,   'instance of builder');
            })
            .catch(noErrors)
    })
    it('testing extentions mechanism', function () {
        let bc = okd.namespace('hello')
            .from_template({ name: 'micro-1' }, './tmpl/build.yml')

        assert.isFunction(bc.binary, 'bc should have a binary function')
    })


    it('image stream must contain watch', function () {

        let is = okd.namespace('hello').is
        assert.isDefined(is.watch, 'watch should be defined')
    })

    it('watching a build', function (done) {
        this.timeout(60000)
        okd.namespace('hello')
        let bc = okd.from_template({name: 'micro-x'}, './tmpl/build.yml')
        assert.isFunction(okd.is.watch,  'watch  should be a function')
        assert.isFunction(okd.is.on_new, 'on_new should be a function')

        okd.is.on_new('micro-x', img => {
            assert.include(img, 'hello/micro-x', 'we should get an new image hash here')
            done()
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

    it('testing getting logs from one container', () => {
        let t = okd
            .namespace('test')
            .pod

        return t.logs('my-pod')
                .then(logs => {
            assert.equal(logs, 'Hello World\n', 'should be Hello Kubernetes!')
        })
    })

    it('getting containers', () => {
        let pod = ["name",
            "image",
            "command",
            "ports",
            "resources",
            "terminationMessagePath",
            "terminationMessagePolicy",
            "imagePullPolicy"]

        return okd.namespace('test')
            .deploy
            .containers('sleep')
            .then(containers => {
                console.log()
                assert.deepEqual(pod, Object.keys(containers[0]), 'should be a container'  )
            })

    })

    it('getting Running pods', ()=>{
        assert.isFunction(okd.pod.running, 'should be a function')
        
        return okd.namespace('test').pod.running().then(pods => {
            pods.forEach(pod => assert.equal('Running', pod.status.phase, 'We expect here running status'))
        })
    })

    it('getting Succeed pods', ()=>{
        assert.isFunction(okd.pod.succeeded, 'should be a function')
        
        return okd.namespace('test').pod.succeeded().then(pods => {
            pods.forEach(pod => assert.equal('Succeeded', pod.status.phase, 'We expect here completed status'))
        })
    })

    it('deleting a build' , () => {
        okd.namespace('hello')

        let removing = [okd.is, okd.bc].map( obj => obj.remove('micro-x')  )

        return Promise.all(removing).then(ok => {
            ok.forEach( obj => assert.deepInclude(obj, {status: 'Success'}, 'deleting resource should succeed') )
        })
    })


})
