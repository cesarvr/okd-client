const _  = require('lodash')
const fs = require('fs')

const endpoints    = require('../endpoints')
const template     = require('../template')
const client = require('../client')
const base   = require('../base')

const build_url = ({cluster, namespace, build_name}) =>
    `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs/${build_name}/instantiatebinary`


function check_file(path) {
    if ( !fs.existsSync(path) )
        throw `File not found!: ${path}`
}

const okd_call = (rest_client, file) => rest_client
                                          .config({ timeout: 60000  })
                                          .body(fs.createReadStream(file))
                                          .done()

function decorate(bc, okd) {

    bc.image = (opts, bc_name) => {
      let build_name = bc_name || bc.get_name()

      let image_stream = okd.from_template({ name: build_name },
                                  `${__dirname}/../../tmpl/imagestream.yml`)

      image_stream.on_new(build_name, opts.new)
    }

    bc.binary = (file_path, bc_name) => {
        let config = okd.get_config()
        let build_name = bc_name || bc.get_name()

        let image_stream = okd.from_template({ name: build_name },
                                    `${__dirname}/../../tmpl/imagestream.yml`)

        let url =  build_url( _.merge( config, { build_name } ) )
        let cli =  client().Post(url, okd)

        check_file(file_path)

        return image_stream.post()
            .then(done => okd_call(cli, file_path)
            .then( ({body}) => JSON.parse(body) ))
    }
}

function extend(obj) {
    let bc = obj['bc']

    if( !_.isUndefined( bc ) )
        bc = decorate(bc, obj)
}

module.exports = extend
