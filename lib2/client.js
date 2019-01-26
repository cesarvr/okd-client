const request = require('request')
const _ = require('lodash')

const client = function() {
    payload = {}
    let self = {}

    self.token = (token) => {
        payload = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept' : 'application/json',
                'Content-Type': 'application/json',
            }
        }
        return self
    }

    self.headers = (headers) => {
        payload.headers = headers
    } 

    self.config = (config) => {
        payload = _.merge(payload, config)
        return self
    }
    
    self.body = (_body) => {
        if (_.isEmpty(_body))
            throw 'Body cannot be empty.'
        payload.body = _body
        return self
    }

    self.target = (name) => { 
        payload.url = payload.url + '/' +name 
        return self
    }
    self.dbg = () => {
        console.log('payload ->', payload)
        return self
    }

    self.values = () => {
        return payload
    }

    self.done = () => {
        return new Promise((resolve, reject) => {
            request(payload, (error, resp, body) => {
                if(error) 
                    reject({status: -1, 
                        error,
                        url: payload.url
                    })

                let status = resp.statusCode
                if (status >= 200 && status < 300 ) {
                    resolve({body, status, resp})
                } else 
                    reject({
                        status, 
                        error: error || 
                        `Error HTTP status ${status}`,
                        url: payload.url
                    })
            })
        })
    }

    return self 
}


module.exports = client
