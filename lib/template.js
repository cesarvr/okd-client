const yaml = require('yamljs')
const _ = require('lodash')
const fs = require('fs')
const client = require('./client')
const endpoints = require('./endpoints')


function validate({kind, RESTful}){
  if(kind === undefined) throw `Error: Template ${template.kind} not supported yet.`
  if(RESTful === undefined) throw `Error: Initializing API.`
}

let loadAndCompile = ({fields, file})=>{
  let data  = fs.readFileSync(file).toString()
  let compiled = _.template(data)

  return compiled(fields)
}

let setupAPI = (template, RESTful) => {
  let kind = endpoints.supported[template.kind]
  let API = RESTful[kind] 

  validate({kind, RESTful})

  Object.keys(API)
    .forEach(key => 
      API[key] = API[key].bind(null, template.metadata.name, 
        JSON.stringify(template)) )



  return API
}

let loadJSON = (RESTful, {fields, file}) => {
  let template = JSON.parse( loadAndCompile({fields, file}) )
  return setupAPI(template, RESTful)
}

let loadYML = (RESTful, {fields, file}) => {
  let template = yaml.parse( loadAndCompile({fields, file}) )
  return setupAPI(template, RESTful)
}

module.exports = function template(RestfulAPI) {
  RestfulAPI.loadYML  = loadYML.bind(null, RestfulAPI)
  RestfulAPI.loadJSON = loadJSON.bind(null, RestfulAPI)

  return RestfulAPI
} 
