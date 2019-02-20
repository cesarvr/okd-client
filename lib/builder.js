const _ = require('lodash')
const template  = require('./template')
const api    = require('./endpoints')
const base   = require('./base')

const bc     = require('./concrete/bc')
const deploy = require('./concrete/deploy')
const watch  = require('./concrete/watch')
const logs   = require('./concrete/logs')

let decorators = [ bc, deploy, watch, logs]

function relevant_service(tmpl, _builder) {
    let functionality = api.supported[tmpl.val().kind]

    if( _.isUndefined(functionality) )
        throw `This object is not supported ${tmpl.kind} \\n object ${JSON.stringify(tmpl)} `

    let service = _builder[functionality]
    return service
}

function builder(cluster, token) {
    let self = {}

    self.config = (cb) => {
        return cb({ token: token,
                    strictSSL:false,
                    namespace: self.ns,
                    cluster,
        })
    }

    self.get_config = function() {
      return {
          token: token,
          strictSSL:false,
          namespace: self.ns,
          cluster,
      }
    }

    self.namespace = (namespace) => {
        self.ns = namespace
        return self
    }

    self = base(cluster, token, self)

    self.from_template = function(opts, path){
        let tmp = builder(cluster, token).namespace(self.ns)

        let tmpl = template.load(opts, path)

        tmp = relevant_service(tmpl, tmp)

        tmp.load(opts, path)
        return tmp
    }

    decorators.forEach(decorator => decorator(self) )
    return self
}


module.exports = builder
