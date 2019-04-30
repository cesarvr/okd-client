const assert = require('chai').assert
const Store  = require('../../lib/store')
const okd    = require('../../lib/okd')
const { delay } = require('./helper')
let WK = require('../../lib/workspace')


let store  = new Store()
let workspace = new WK()
const MY_BUILD = 'my-binary-build'

let build_config = null
let package_for_build = null
let imgstream = null

const BUILD_TYPE = {kind: 'Build'}

before(function() {
    this.timeout(30000)
    package_for_build = workspace.compress('./tt.tar')

    return okd(store.configuration)
        .then(api => {
            /*creating objects*/
            build_config = api
                .namespace('hello')
                .from_template( { name: MY_BUILD }, './tmpl/build.yml')

            imgstream = api.namespace('openshift').is

            return build_config.post()
        })
        .catch((err) =>  console.log('Failing creating a build configuration: ', err ))
})

after(function (){
    workspace.clean()
    return delay.then(ok => build_config.remove() )
})

describe('Testing Build Configuration', function () {

    it('Imagestream build' , () => {
        return imgstream.all().then(iss => console.log('iss->', iss.items.forEach(img => console.log('img->', img.metadata.name)) ))
    })

    it('Making a binary build', done => {
        this.timeout(30000)

        build_config.image({ new : image_tag => {
            assert.include( image_tag, '172.30.1.1:5000/hello/my-binary-build', 'we expect a image tag here')
            done()
        }})

        build_config.binary(package_for_build)
            .then(ok => assert.deepInclude(ok, BUILD_TYPE, 'should return okd object from server') )
            .catch(errors => assert.isNull(errors))
    })
})
