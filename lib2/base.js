const _ = require('lodash')

const endpoints    = require('./endpoints')
const template     = require('./template')
const client = require('./client')

let set_token = function(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Accept' : 'application/json',
        'Content-Type': 'application/json'  
    }
}

function base(cluster, token,self) {
    let strictSSL = false

    const prepare = (url, method) => {  
        let cli = client() 
        cli.headers( set_token(token) )
        cli.config({ method, url, strictSSL })
        return cli
    }

    const get_name = (tmpl, name) => {
        if(!_.isEmpty( name) ) return name

        let n = tmpl.name()

        if(_.isEmpty(n))
            throw 'This function requires a resource name.'

        return n
    }

    const run = (cli) => cli.done()
        .then( ({body}) => JSON.parse(body) )

    Object.keys(endpoints).forEach(key => {
        self[key] = self[key] || {}

        self[key].all = () => {
            let url      = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'GET')
            return run( cli ) 
        }

        self[key].by_name = (name) => {
            let url      = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'GET')
                .target(name)

            return run( cli ) 
        }       

        self[key].remove = (name) => {
            let url      = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'DELETE')
                .target(name)

            return run( cli ) 
        }

        self[key].template = ( name, file) => {
            self[key]._tmpl = template.load(name, file)
            return self[key]
        }

        self[key].post = (name) => {
            let url = endpoints[key](cluster, self.ns)
            let cli = prepare(url, 'POST')
                .body( self[key]._tmpl.str() )

            return run( cli ) 
        }

        self[key].exist = (name) => {
            name = get_name(self[key]._tmpl, name) 

            return self[key].by_name(name)
                     .then(({status}) => status === 200)
        }

        self[key].create = self[key].post     
    })

    return self
}





module.exports = base
