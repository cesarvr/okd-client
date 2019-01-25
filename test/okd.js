var assert = require('chai').assert
var { ImageStream } = require('../lib/okd')
var Store = require('../lib/store')



describe('Testing the okd API [make sure OpenShift is running...]', function () {

 let test_is = null 
 let store   = new Store() 
    /*
     *test_is.on('image', (image)=> console.log('docker registry->', image) )
        test_is.on('error', (error)=> console.log('Image stream error->', error) )
        test_is.on('deleted', (error)=> console.log('Deleted->', error) )
        test_is.get()
        test_is.del()

     *
     */

 it('creating an ImageStream', function () {
    assert.isNotTrue(ImageStream === undefined, 'shouldn\'t be null');
    assert.isFunction(ImageStream, 'ImageStream should be an constructor');
    test_is = new ImageStream({name: 'test-is'})
    assert.instanceOf(test_is, ImageStream, 'should be an instance');
 })

 it('checking endpoint', () => {
    
    assert.isFunction(test_is.getEndpoint, 'getEndpoint should be a function.')
     assert.equal(test_is.getEndpoint(store.configuration), 'https://192.168.64.2:8443/apis/image.openshift.io/v1/namespaces/hello/imagestreams', 'should be equals to test URL'  )
    
 })
 

})
