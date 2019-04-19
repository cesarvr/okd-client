const _ = require('lodash')

const endpoints   = require('./endpoints')
const template    = require('./template')
const client      = require('./client')

function base(cluster, token, self) {
    let strictSSL = false

    const prepare = (url, method) => {  
        let cli = client() 
        cli.token( token )
        cli.config({ method, url, strictSSL })
        return cli
    }

    const get_name = (tmpl, name) => {
        if(!_.isEmpty( name) ) return name

        let n = tmpl.gs.get_name()

        if(_.isEmpty(n))
            throw 'This function requires a resource name.'

        return n
    }

    const run = (cli) => cli.done()
        .then( ({body}) => JSON.parse(body) )

    Object.keys(endpoints).forEach(key => {
        self[key] = self[key] || {}

        self[key].all = () => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'GET')
            return run( cli ) 
        }

        self[key].by_name = (name) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'GET')
                        .target(name)

            return run( cli ) 
        }       

        self[key].remove = (name) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'DELETE')
                        .target(name)

            return run( cli ) 
        }

        self[key].load = ( opts, file) => {
            self[key]._tmpl = template.load(opts, file)
            self[key] = _.merge(self[key], self[key]._tmpl.gs)
            return self[key]
        }

        self[key].post = (name) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'POST')
                        .body( self[key]._tmpl.str() )

            return run( cli ) 
        }


        self[key].replace = (name, component) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'PUT')
                        .target(name)
                        .body( JSON.stringify(component) )

            return run( cli ) 
        }

        const put = (name, resource_obj) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'PUT')
                .target(name)
                .body( JSON.stringify(resource_obj) )
                .dbg()

            return run( cli ) 
        }

        self[key].put = (name, update) => {
            let _put = put.bind(null, name)
            return self[key].by_name(name)
                            .then( obj =>{ 
                                return _put( _.merge(obj,update) )  
                            })  
        }

        self[key].update = self[key].put

        self[key].patch = (name, body) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'PATCH')
                .target(name)

            cli.headers({'Content-Type' : 'application/json-patch+json'})
                .body(body)
            return run( cli )
        }

        self[key].create = self[key].post     
    })

    return self
}

module.exports = base
