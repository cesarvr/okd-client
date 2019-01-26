const _ = require('lodash')
const template  = require('./template')

const bc = require('./concrete/bc')
const base = require('./base')

let decorators = [ bc ]

let supported = {
    'BuildConfig':'bc',
    'DeploymentConfig':'dc',
    'ImageStream':'is',
    'Route':'route',
    'Service':'svc',
}



function relevant_service(tmpl, _builder) {
    let functionality = supported[tmpl.val().kind]

    if( _.isUndefined(functionality) )  
        throw `This object is not supported ${tmpl.kind} \\n object ${JSON.stringify(tmpl)} `

    let service = _builder[functionality]
    return service 
}

function builder(cluster, token) {
    let self = {}

    self.prepare_endpoint = (cb) => {
        return cb(cluster, self.ns) 
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

        tmp.template(file, path)
        decorators.forEach(decorator => decorator(tmp) )
        return tmp
    }

    decorators.forEach(decorator => decorator(self) )
    return self
}
    
    
module.exports = builder
