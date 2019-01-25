const _ = require('lodash')
const request = require('request')

class Client {
    constructor({strictSSL}) {
        this.payload = {
            strictSSL
        }
    }

    setToken(token) {
        this.payload.headers = {
            'Authorization': `Bearer ${token}`,
            'Accept' : 'application/json',
            'Content-Type': 'application/json',
        }

        return this
    }

    config(config) {
        this.payload = _.merge(this.payload, config)
        return this
    }

    body(body) {
        this.payload.body = body
        return this
    }

    debug(){
        console.log('options: ', this.payload)
        return this
    }

    handle_error(status, error){
      return {
          code: status,
          error: error || `HTTP status code: ${status}`
        }
    }

    call(){
        return new Promise((resolve, reject) => {
            request(this.payload, (error, resp, body) => {
                let status = resp.statusCode
                if (status >= 200 && status < 300 ) {
                    resolve({body, status: resp.statusCode})
                } else {
                  let errorMessage = this.handle_error(status, error)
                  reject(errorMessage)
                }

            })
        })
    }
}

module.exports = Client
