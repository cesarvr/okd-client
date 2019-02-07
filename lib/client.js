const request = require('request')
const _ = require('lodash')
const tools = require('./tools')

function read_error(error, payload){
    let code = error.code
    if(code === 'SELF_SIGNED_CERT_IN_CHAIN')
    {
        return {
            code,
            payload,
            message: `The server is using a self-signed certificate, you can try using {strictSSL:false} as an option in the login parameters.  example: login({cluster:'192.0.0.1', user:'user', {strictSSL: false} })`
        }
    }

    if(code === 'ETIMEDOUT'){
        return {
            code,
            payload,
            message: `The server didn't respond inside the 5 seconds window.`
        }
    }

    return  { error, url: payload.url }
}

function is_data_incomplete(data) {
    let cnt = tools.count(data, ['{', '}'])
    return cnt['{'] !== cnt['}']
}

function _stream(request, cb) {
    request.on('response', (resp) => {
      resp.on('data', buff => cb(buff))
      resp.on('end', buff =>  console.log('end?????'))
    })
}

const client = function() {
    let payload = {
        timeout: 5000
    }
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

    self.stream = (cb) => {
        _stream(request(payload), cb)
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
                if(error) {
                    reject(read_error(error, payload))
                }

                if(!_.isUndefined(resp) ) {
                    resolve({
                        body,
                        status: resp.statusCode,
                        resp
                    })
                }
            })
        })
    }

    return self
}


module.exports = client
