const OKDResource = require('./resources')


class Service extends OKDResource {
    constructor({name}){
        super({type: 'service', name: name})
        this.endpoint = ({cluster, namespace}) => `${cluster}/api/v1/namespaces/${namespace}/services`
    }

    ports({target, port}) {
        this.tmpl.spec.ports.port = port
        this.tmpl.spec.ports.targetPort = target
        return this
    }
}

class Route extends OKDResource {
    constructor({name}){
        super({type: 'route', name})
        this.endpoint = ({cluster, namespace}) => `${cluster}/apis/route.openshift.io/v1/namespaces/${namespace}/routes`
    }

    ports({target, port}) {
        this.tmpl.spec.ports.port = port
        this.tmpl.spec.ports.targetPort = target
        return this
    }
}

class ImageStream extends OKDResource {
    constructor(client){
        super(client)
        this.type = 'imagestream'
        this.POST = ({cluster, namespace}) => `${cluster}/apis/image.openshift.io/v1/namespaces/${namespace}/imagestreams`
        this.GET  = ({cluster, namespace, name}) => `${cluster}/apis/image.openshift.io/v1/namespaces/${namespace}/imagestreams/${name}`
    }

    _get(body) {
       super._get(body)
       this.emit('image', this.image())
    }
    _post(body) {
      super._get(body)
      this.emit('image', this.image())
    }

    image() {
        return this.template.status.dockerImageRepository
    }
}

class StartBuild extends OKDResource {

    constructor(client){
        super(client)
        this.type = 'binary'
        this.endpoint = ({cluster, namespace, name}) =>
                `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs/${this.name}/instantiatebinary`
    }
}

class Build extends OKDResource {
  constructor(client){
    super(client)
    this.type = 'build'
    this.POST = ({cluster, namespace}) =>
                `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs`

    this.GET  = ({cluster, namespace, name}) =>
          `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs/${name}`
  }

  _post(body){
    super._post(body)
  }
}


module.exports = { Service, ImageStream, Build, StartBuild }
