

class Endpoint {
  constructor(endpoints){
    this.endpoints = endpoints
    this.replacements = []
  }

  add(placeholder, value){
    if ( value === undefined )
      console.warn(`Warning: Empty value for property: ${placeholder}`)

    this.replacements.push({ placeholder, value })
  }

  entries() {
    return this.endpoints.map(({name}) =>{ 
      return {
        method: name,
        URL: this.getURL(name) 
      }
    })
  }

  find(key, val){
    return this.endpoints.find(ep => ep[key] === val)
  }

  getURL(name){
    let info = this.find('name', name)

    if(info === undefined)
      throw `Error: cannot find ${name} in endpoint list.`
  
    let { endpoint } = info

    this.replacements
        .forEach(({ placeholder, value }) => {
      endpoint = endpoint.replace(placeholder, value)
    })

    return endpoint 
  }

}


module.exports = Endpoint
