const yaml = require('yamljs')
const _ = require('lodash')
const fs = require('fs')
const client = require('./client')

function okd_template (tmpl) {
    let self = {}
    self.val  = () => tmpl
    self.str  = () => JSON.stringify( tmpl )

    let gs = {}
    gs.get_name = () => tmpl.metadata.name
    gs.set_name = (name) => tmpl.metadata.name = name

    gs.get_labels = ()  => tmpl.metadata.labels
    gs.set_labels = (obj) => {
      tmpl.metadata.labels = _.merge( tmpl.metadata.labels, obj )
    }

    self.gs = gs

    return self
}

let load = (opts, file) => {
    let yml_raw  = fs.readFileSync(file).toString()
    let compiled = _.template(yml_raw)
    let json     = yaml.parse( compiled(opts) )
    return okd_template(json)
}

module.exports = { load }
