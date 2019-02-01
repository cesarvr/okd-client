const request = require('request')
const _ = require('lodash')
const tools = require('./tools')

function is_data_incomplete(data) {
    let cnt = tools.count(data, ['{', '}'])
    return cnt['{'] !== cnt['}'] 
}

const client = function() {
    let payload = {}
    let self = {}

    self.token = (token) => {
        self.headers({
            'Authorization': `Bearer ${token}`,
            'Accept' : 'application/json',
        })

        return self
    }

    self.headers = (headers) => {
        payload.headers = _.merge(payload.headers, headers)
        return self
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
        console.log('DBG: ', payload)
        return self
    }

    self.values = () => {
        return payload
    }

    self.raw = (cb) => {
        let chunk = ''
        request(payload) 
            .on('response', (resp) => {
                resp.on('data', buff => {
                    let str = buff.toString()
                    chunk += str 
                    if(!is_data_incomplete(chunk)) {
                        cb(JSON.parse(chunk))
                        chunk = ''
                    }
                })
            })
    }

    self.done = () => {
        return new Promise((resolve, reject) => {
            request(payload, (error, resp, body) => {
                if(error) 
                    reject({status: -1, 
                        error,
                        url: payload.url
                    })

                if(_.isUndefined(resp) ) throw 'Empty response, timeout' 

                    let status = resp.statusCode
                if (status >= 200 && status < 300 ) {
                    resolve({body, status, resp})
                } else 
                    resolve({ status, body })
            })
        })
    }

    return self 
}


module.exports = client
