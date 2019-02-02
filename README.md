## OKD Node.js Client

This API allows you to make calls to the Kubernetes/OpenShift server for now it support Creation, Read, Update (via Patch) and Delete (CRUD) for some basics resources like:

### OpenShift  
  - [ImageStream](https://docs.openshift.com/enterprise/3.0/architecture/core_concepts/builds_and_image_streams.html)
  - [BuildConfig](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html)
  - [DeploymentConfig](https://docs.openshift.com/enterprise/3.0/dev_guide/deployments.html)
  - [Router](https://docs.openshift.com/container-platform/3.9/install_config/router/index.html)

### Kubernetes
- [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Service](https://kubernetes.io/docs/concepts/services-networking/service/)


The objective of this library is to make easier to automate flows in this two container platforms by expressing your intentions in Javascript.


## Login

### Installing

```sh
  npm i okd-api
```

### Login into OpenShift


```js
const {login, okd} = require('./lib/okd')
```

This API exposes two objects ```login``` which handles the login and ```okd``` which handles the interaction with the server.

You have two options to operate against the platforms one is login in:

#### Login

```js
let config = {
  cluster:'https://okd.address.com/',
  user: 'user',
  password: '***',
  strictSSL: true || false  
}

login(config)
    .then(okd => {
      //get all services.
      return okd.namespace('dev-01').svc.all() /* Returns...
                                                   [ 
                                                     { kind: Service,
                                                       apiVersion: v1,
                                                       metadata:,
                                                       ...
                                                     },
                                                     ....
                                                   ]
                                                */
    })
    .then(services => console.log('print: ', services))
    .catch(err => console.log('promise failed: ', err))
```

#### By Token

If you have a token you can do the use the ```okd``` object directly:

```js
  const cluster = `https://minishfit.vm:8443/`
  const toke = 'v0tDED5vjN7Vv...'
  let imagestream = okd(cluster, token).namespace('dev-665').is

  imagestream.all().then(/*...*/)
                   .catch(/*...*/)
```

It's up to the developer to manage the session as he seems fit.

### Resources

Before you can do something with any object in the cluster you first need to select a namespace.

```js
  okd.namespace('dev-665')
```

### Resources

The ```okd``` object acts as a root object for all the available resources.

```
  okd.is     // OpenShift ImageStream
  okd.bc     // OpenShift BuildConfig
  okd.dc     // OpenShift DeploymentConfig
  okd.route  // OpenShift Routes
  okd.svc    // OpenShift/Kubernetes services
  okd.deploy // OpenShift/Kubernetes deployment
```
## Operations

Each operation return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Find

You can find resources by name:

```js
  okd.namespace('dev-665')
     .is
     .by_name('nodejs-image')
```
This will look for a [image-stream](okd.namespace('dev-665')
   .is
   .by_name('nodejs-image')) object named ``nodejs-image``.


Or you can fetch all resources:

```js
  okd.namespace('dev-665')
     .is
     .all()
```

### Remove

To remove a resource you just need to this:

```js
okd.namespace('dev-665')
   .is
   .remove('nodejs-image')
```

This will remove the ```nodejs-image``` image stream.


### New resource

Send a post request to the server and send a template.

Let say you have a template to create a new deployment called ``deploy.yml``.

```yml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: <%=name%>
  labels:
    app: <%=name%>
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <%=name%>
  template:
    metadata:
      labels:
        app: <%=name%>
    spec:
      containers:
      - name: <%=name%>
        image: nginx
        command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
        ports:
        - containerPort: 8080
```


The ``<%=name%>`` are place holders that works very similar to the Javascript [template engines](https://stackoverflow.com/questions/4778881/how-to-use-underscore-js-as-a-template-engine). To publish this to the server you just need to do:

```js
  let deploy = okd.namespace('dev-665').deploy
  deploy.load('deploy-x', 'deploy.yml').post()
```

This code will send the template in this form:

```yml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: deploy-x
  labels:
    app: deploy-x
spec:
  replicas: 1
  ...
```

This can be improved by better by-key approach but thats will come in the version, but if you need to modify the template you can do this:

```js
let deploy = okd.namespace('dev-665').deploy
let object = deploy.load('deploy-x', 'deploy.yml')._tmpl   //pass by reference


object.metadata.name = 'deploy-y'
deploy.post()   // we send the template with the amended field.
```

### Update resource

To update a resource we just need to send a [json-PATCH](http://jsonpatch.com/) request.


Let's update the image of a deployment:

```js
let update = {
  op:'replace',
  path:'/spec/template/spec/containers/0/image', value: 'awesome:test-23'
}

let deploy = okd.namespace('dev-001').deploy

deploy.patch('awesome-app', update)
```

This will update the deployment object and automatically this change will trigger a re-deployment.


# Shortcuts

Some operations above can be done more faster for example the resource creation, here is an alternative on how to do this:

```js
  okd.namespace('dev-003')
  okd.from_template(this.appName,'./tmpl/imagestream.yml').post()
```

**from_template** will autodetect the type of template you try to use and if its supported you can perform the actions.

This is...
```js
  let deploy = okd.from_template(this.appName,'./tmpl/deployment.yml')
```

...is the same as this.

```js
let deploy = okd.deploy.load('deploy-x', 'deploy.yml')
```

The difference is that you don't need to know what type of object you are dealing with.

Let's say you have a bunch of resources in the form of templates.

```js

  //['tmpl0.yml','tmpl1.yml', 'tmpl2.yml'... ]
  let objs = get_all_templates()
                .map(tmpl => okd.from_template(tmpl))

  // create all
    objs.forEach(obj => obj.create())


  //delete all
    objs.forEach(obj => obj.remove())    


 // Imagine all those templates represent deployments
   objs.forEach(obj => updateObjects(obj))
```
