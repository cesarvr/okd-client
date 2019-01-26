const yaml = require('yamljs')
const _ = require('lodash')
const fs = require('fs')
const client = require('./client')

function okd_template (tmpl) {
    let self = {}
    self.val  = () => tmpl
    self.str  = ()=> JSON.stringify( tmpl )
    self.name = () =>  tmpl.metadata.name

    return self
}

let load = (title, file) => {
    let yml_raw = fs.readFileSync(file).toString()
    let compiled = _.template(yml_raw)
    let json =  yaml.parse( compiled({name: title }) )
    return okd_template(json)
}

module.exports = { load }
