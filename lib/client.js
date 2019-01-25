const request = require('request')
const OKDObjects = require('./okd')
const _ = require('lodash')

function credentials({user, password}) {
    let credentials = `${user}:${password}`
    return `Basic ${Buffer.from(credentials).toString('base64')}`
}

class OKDFactory {
    constructor(okd){
        this.okd = okd
    }

    create(objectName, title){
        let ctor = OKDObjects[objectName]

        if(_.isUndefined(ctor))
          throw new Error(`No object called ${name}`)

        let obj = new ctor(this.okd.configuration)
        obj.name(title)
        return obj
    }
}

class OKD {
    constructor(configuration){
        this.config = configuration
    }

    extractTokenFromURL(hash) {
      const startIndex = hash.indexOf('=') + 1
      const stopIndex = hash.indexOf('&')
      return hash.slice(startIndex, stopIndex)
    }

    login() {
        let factory = new OKDFactory(this)

        return new Promise((resolve, reject) => {
            const options = {
                method: 'GET',
                url: `${this.config.cluster}/oauth/authorize?response_type=token&client_id=openshift-challenging-client`,
                headers: {
                    'X-CSRF-Token': 1,
                    'Authorization': credentials(this.config)
                },
                strictSSL: this.useSSL(this.config),
            }

            request(options, (err, resp) => {
                if(err)
                  reject(err)
                else{
                  this.config.token = this.extractTokenFromURL(resp.request.uri.hash)
                  resolve(factory)
                }
            })
        })
    }

    useSSL(opts){
        if(opts.strictSSL === undefined)
            return true

        return opts.strictSSL
    }

    get configuration() {
        return this.config
    }

}

module.exports = { OKD }
