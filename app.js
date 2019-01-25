const _ = require('lodash')
const Store = require('./lib/store')
const Workspace = require('./lib/workspace')
const fs = require('fs')
const yaml = require('yamljs')
const { ImageStream } = require('./lib/okd')
const { OKD } = require('./lib/client')

let store = new Store()
let workspace = new Workspace()
let configuration = store.configuration


let is = new ImageStream({name: 'xtoby-test'})

let okd = new OKD(configuration)

function _delete(okdFactory) {
      let build = okdFactory.create('Build', 'deletemex2')
      let is = okdFactory.create('ImageStream', 'toby')
      let iss = okdFactory.create('ImageStream', 'ss')

      is.on('removed', ()=> console.log('cool is removed!'))
      build.on('removed', () => console.log('cool build removed!'))

      is.on('error', (err)=> console.log(err))
      build.on('error', (err)=> console.log(err))
      is.remove()
      build.remove()
      iss.remove()

      return okdFactory
}

function createBuild(okdFactory) {
      let build = okdFactory.create('Build', 'deletemex2')
      build.on('not_found', () => {
        console.log('build not there creating...')
        build.loadTemplate('./tmpl/build.yml').post()
      })
      build.get()

      return okdFactory
}


function start (okdFactory) {

    let is = okdFactory.create('ImageStream', 'toby')

    is.on('image',     (image) => console.log(`image : ${image}`) )
    is.on('not_found', () => {
      console.log('is not there creating...')
      is.loadTemplate('./tmpl/imagestream.yml').post()
    })
    is.get()

    return okdFactory
}

function delay (okd) {
  return new Promise((resolve, reject)  => setTimeout(()=>resolve(okd), 5000) )
}

okd.login()
    .then(start)
    .then(createBuild)
    .then(delay)
    //.then(upload)
    .then(_delete)
    .catch(err => console.log(`auth failiure: ${err}`))
