const _ = require('lodash')

function base(client) {

  return (endpointURL) => {
    let RESTful = {} 
    let url = endpointURL

    const run = (cli) => { 
      return  cli
        .done()
        .then( ({body}) => JSON.parse(body) )
    }

    RESTful.all = () => {
      let cli = client.config({url, method:'GET'})
      return run( cli ) 
    }

    RESTful.by_name = (name) => {
      let cli = client.config({url, method:'GET'})
        .target(name)

      return run( cli ) 
    }       

    RESTful.remove = (name) => {
      console.log('name->', name)
      let cli = client.config({url, method:'DELETE'})
        .target(name)

      return run( cli ) 
    }

    RESTful.post = (name, payload) => {
      let cli = client.config({url, method:'POST'})
        .body( payload )

      return run( cli ) 
    }

    RESTful.replace = (name, component) => {
      let cli = client.config({url, method:'PUT'})
        .target(name)
        .body( JSON.stringify(component) )

      return run( cli ) 
    }

    const put = (name, payload) => {
      let cli = client.config({url, method:'PUT'})
        .target(name)
        .body( JSON.stringify( payload ) )
        .dbg()

      return run( cli ) 
    }

    RESTful.put = (name, update) => {
      let _put = put.bind(null, name)
      return RESTful.by_name(name)
        .then( obj =>{ 
          return _put( _.merge(obj,update) )  
        })  
    }

    RESTful.patch = (name, body) => {
      let cli = client.config({url, method: 'PATCH'})
        .target(name)

      cli.headers({'Content-Type' : 'application/json-patch+json'})
        .body(body)

      return run( cli )
    }
 
    return RESTful
  }
}

module.exports = base
