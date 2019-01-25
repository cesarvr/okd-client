const Event = require('events')
const fs    = require('fs')
const _     = require('lodash')
const yaml  = require('yamljs')
const Client = require('./rest')


class OKDResource extends Event {
    constructor(configuration) {
        super()
        this.configuration = configuration
        this.endpoints = {}
        this.client = new Client(this.configuration)
        this.client.setToken(this.configuration.token)
    }

    loadTemplate(file) {
        if (_.isEmpty(this.type) )
          throw new Error('Cannot find the type.', this)

        let yml_raw = fs.readFileSync(file).toString()
        let compiled = _.template(yml_raw)
        this.template = yaml.parse( compiled({name: this._name }) )
        return this
    }

    params() {
        let namespace = this.configuration.namespace
        let cluster   = this.configuration.cluster
        let name = this._name
        return {namespace, cluster, name}
    }
    _get(resp)    {
      this.template = JSON.parse( resp.body )
    }
    _post(resp)   {
      this.template = JSON.parse( resp.body )
      this.emit('new', resp.body )
    }
    _put()    {}
    _remove() {
      this.emit('removed', {})
    }

    name (name) {
        if(_.isEmpty( name ) )
          throw new Error(`this entity (${this.type}) needs a name`)

        this._name = name
        return this
    }

    selector(obj){
        let ref = this.tmpl.spec.selector
        ref = _.merge(ref, obj)
        return this
    }

    handle_error(err){
      if(err.code === 404)
        this.emit('not_found', {})
      else
        this.emit('error', err)
    }

    make_call(method, sucess) {
      let url = this.GET( this.params() )
      this.client.config({method: method, url})
            .call()
            .then(body => sucess(body))
            .catch(err => this.handle_error(err))
    }

    post() {
      let url = this.POST( this.params() )
      this.client.config({method: 'POST', url})
            .body(JSON.stringify( this.template ))
            .call().then(body => this._post(body))
            .catch(err => this.handle_error(err))
    }

    remove() {
        this.make_call('DELETE', this._remove.bind(this))
    }

    get() {
        this.make_call('GET', this._get.bind(this))
    }

    debug() {
        console.log(this.tmpl)
        return this
    }
}

module.exports = OKDResource
