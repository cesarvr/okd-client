const _     = require('lodash')
const Store = require('./lib2/store')
const Workspace = require('./lib2/workspace')
const {login, okd} = require('./lib2/okd')

let store = new Store('./config-cloud.json')

function preparing_patch (image) {
    let patch_image = [{op:'replace', path:'/spec/template/spec/containers/0/image', value: image }] 
    return JSON.stringify(patch_image)
}

function api() {
    let config = store.configuration
    return okd(config.cluster, config.token).namespace('hello-x')
}

function create_app(api) {
    let is     = api.from_template('micro-x','./tmpl/imagestream.yml')
    let bc     = api.from_template('micro-x','./tmpl/build.yml')
    let deploy = api.from_template('micro-x','./tmpl/kube-deploy.yml')
    let svc    = api.from_template('micro-x','./tmpl/service.yml')

    let all = [is, bc, deploy, svc]

    return Promise.all(all.map( p => p.post() )) 
}

function save_tokens(api) {
    api.config((config) => store.save(config) )
    return api 
}

const retrieve_last_image = (event) => {
 let tag = event.object.status.tags.shift()
 return tag.items.shift().dockerImageReference
}

function watching(oo){
    let is = api().is 
    let deploy = api().deploy 

    console.log('watching....')
    is.watch('micro-x', (event) => {
        if(event.type === 'MODIFIED') {
            let _img = retrieve_last_image(event) 
            //console.log('preparing_patch->', preparing_patch(_img))
            deploy.patch('micro-x', preparing_patch(_img))
                  .then( ok => console.log('updating image-> ', ok))
                  .catch(error => console.log('updating image error: ' , error)) 
        }
    })
}

function makeRoute(api) {
    const _api = api || api()

    const route = _api.route
    
    return route.by_name('micro-x')
                .then(resp => {
        if (resp.code === 404) {
            console.log('route not found ... creating one')
            return _api.from_template('micro-x','./tmpl/route.yml').post()
        } else 
            return Promise.resolve(resp)
    })
    .then( resp => {
        console.log('finally: ', resp)
    })
}

function ff() {
    let config = store.configuration
    let bc = okd(config.cluster, config.token).namespace('hello-x').bc

    return bc.binary('./tt.tar.gz', 'micro-x')
}


const noErrors = (err) => console.log('err->', err) 

login(store.configuration)
    .then(api => api.namespace('hello-x'))
/*    .then(save_tokens)
    .then(create_app)
    .then(watching)
    .then(ff)
    .then(ok => console.log(ok))*/
   .then(api => makeRoute(api) )
   .catch(noErrors)

