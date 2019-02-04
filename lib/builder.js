const _ = require('lodash')
const template  = require('./template')
const api  = require('./endpoints')

const bc       = require('./concrete/bc')
const is       = require('./concrete/is')
const deploy   = require('./concrete/deploy')
const watch   = require('./concrete/watch')
const base     = require('./base')

let decorators = [ bc, is , deploy, watch]

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
    
    self.namespace = (namespace) => {
        self.ns = namespace
        return self
    }

    self = base(cluster, token, self)

    self.from_template = function(file, path){
        let tmp = builder(cluster, token).namespace(self.ns) 

        let tmpl = template.load(file, path)

        tmp = relevant_service(tmpl, tmp)

        tmp.load(file, path)
        return tmp
    }

    decorators.forEach(decorator => decorator(self) )
    return self
}
    
    
module.exports = builder
