const _  = require('lodash')
const fs = require('fs')

const endpoints    = require('../endpoints')
const template     = require('../template')
const client = require('../client')

const build_url = (cluster, namespace, build_name) =>
    `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs/${build_name}/instantiatebinary`

function setup_client(url, token, strictSSL) {
    let cli = client()
    cli.token( token )
    cli.config({ method: 'POST', url, strictSSL })
    return cli
}

function check_file(path) {
    if ( !fs.existsSync(path) )
        throw `File not found!: ${path}`
}

function decorate(bc, obj) {
    bc.binary = (file_path, bc_name) => {
        let build_name = bc_name || bc.get_name()
        let cli = obj.config(({namespace,
            cluster,
            token,
            strictSSL }) => {
                let url =  build_url(cluster, namespace, build_name)
                let cli =  setup_client(url, token, strictSSL)
                return cli
            })

        check_file(file_path)


        return cli
            .config({
              timeout: 60000
            })
            .body(fs.createReadStream(file_path))
            .done()
            .then( ({body}) => JSON.parse(body) )
    }
}

function extend(obj) {
    let bc = obj['bc']

    if( !_.isUndefined( bc ) )
        bc = decorate(bc, obj)
}

module.exports = extend
