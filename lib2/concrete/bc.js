const _ = require('lodash')

const endpoints    = require('../endpoints')
const template     = require('../template')
const client = require('../client')

function decorate(bc, obj) {
    
    bc.binary = (file_path, bc_name) => {
      let name = bc_name || bc._tmpl.name()
      let endpoint = obj.prepare_endpoint((cluster, ns) =>
            `${cluster}/apis/build.openshift.io/v1/namespaces/${ns}/buildconfigs/${name}/instantiatebinary` ) 

    //  console.log('endpoint =>', endpoint)
    }
}

function extend(obj) {
    let bc = obj['bc']

    if( !_.isUndefined( bc ) ) 
      bc = decorate(bc, obj)
} 

module.exports = extend 

