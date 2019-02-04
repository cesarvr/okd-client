## OKD Node.js Client

This Node.JS RESTful client for Kubernetes/OpenShift platform, you can use it to interact with your cluster API and this way use Javascript to automate task or perform operations.

* [Installing](#install)
* [Login](#login)
* [Initialize With Token](#token)
* [Select Namespace](#ns)
* [Components](#res)
  - [Find All](#all)
  - [Find By Name](#by_name)
  - [Remove](#remove)
  - [Create](#create)
  - [Template](#template)
  - [Update](#update)
* [Shortcuts](#fii)
* [Triggering Builds](#binary)
* [Watch](#watch)





## Login

<a name="install"/>

### Installing

```sh
  npm i okd-api
```

```js
const { okd } = require('./lib/okd')
```


<a name="login"/>

### Login into OpenShift

This API exposes two objects ```login``` which handles the login against a OpenShift cluster.

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

The login functions returns an ``okd`` object after it finish the authentication with the server.



<a name="token"/>

#### With Token

As mentioned before once you login into the server you will receive an ``okd`` object, but if you already have a token (because you previously acquired one through authentication) you can provide the cluster URL and the token.

```js
  const cluster = `https://minishfit.vm:8443/`
  const token = 'v0tDED5vjN7Vv...'
  let imagestream = okd(cluster, token).namespace('dev-665').is

  imagestream.all().then(/*...*/)
                   .catch(/*...*/)
```

<a name="ns"/>

### Namespace

[Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) is a way to partition resources across your Kubernetes/OpenShift cluster. This mean that to access a particular resource such as [BuildConfig](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html) you need to specify the cluster.

```js
  okd.namespace('dev-665')

  /* Now you can use this okd object for resources in the dev-665 namespace*/

  okd.svc.all() /*...*/
```

If you need to operate across multiple namespaces you just need to instantiate multiple objects.

```js
function useNS(ns) {
  const cluster = `https://my-cluster.com/`
  const token = 'v0tDED5vjN7Vv...'
  return okd(cluster, token).namespace(ns)
}

myScripts.forEach(script => useNS('A').from_template('app-1',script).post())
myScripts.forEach(script => useNS('B').from_template('app-1',script).post())
myScripts.forEach(script => useNS('C').from_template('app-1',script).post())
```

<a name="res"/>

### Components

The ```okd``` object acts as a root object for all the available resources.

```
  okd.is     // OpenShift ImageStream
  okd.bc     // OpenShift BuildConfig
  okd.build  // OpenShift Build
  okd.dc     // OpenShift DeploymentConfig
  okd.route  // OpenShift Routes
  okd.svc    // OpenShift/Kubernetes services
  okd.deploy // OpenShift/Kubernetes deployment
```

Each of those function are objects represent one of this elements:

- OpenShift  
  - [ImageStream](https://docs.openshift.com/enterprise/3.0/architecture/core_concepts/builds_and_image_streams.html)
  - [BuildConfig](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html)
  - [Build](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html)
  - [DeploymentConfig](https://docs.openshift.com/enterprise/3.0/dev_guide/deployments.html)
  - [Router](https://docs.openshift.com/container-platform/3.9/install_config/router/index.html)

- Kubernetes
  - [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  - [Service](https://kubernetes.io/docs/concepts/services-networking/service/)


Each element provide a create, read, update and delete RESTful interface:

```js
okd.bc.all()   // find all BuildConfig
okd.bc.by_name('build-1')   // find BuildConfig by name
okd.svc.post()  // new Kubernetes Service
okd.svc.remove()  // remove a Kubernetes Service
okd.route.patch()  // Update a OpenShift route
```

Let's see each function in more detail.


<a name="all"/>

### Find All

Returns a promise returning all resources from a particular type and namespace:

```js
  let is = okd.namespace('dev-665').is

  is.all()      // All imagestreams

  // Or
  okd.namespace('my-ns')   // it works like a state machine.

  okd.svc.all() // All Services
  okd.routes.all() // All Routes
```



<a name="by_name"/>

### By Name

You can also find resources by name:

```js
  okd.namespace('dev-665')
     .is
     .by_name('nodejs-image')
     .then(found => /*...*/)
     .catch(err => /*..*/)
```
This will look for a [image-stream](https://docs.openshift.com/enterprise/3.0/architecture/core_concepts/builds_and_image_streams.html) with the name `nodejs-image`.


<a name="remove"/>

### Remove

To remove a resource from the cluster:

```js
okd.namespace('dev-665')
   .is
   .remove('nodejs-image')
```

It returns a promise with the response from the server.

<a name="create"/>

### Creating

To create Kubernetes/OpenShift objects you can use the following:

```js
  let deploy = okd.namespace('dev-665').deploy
  deploy.post('name')
```

Usually you want to describe the configuration of your components and for that reason there is a  template system.


<a name="template"/>

### Template

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

Basically it use a [Lodash](https://lodash.com/) template engine behind the scene to replace those expressions.  

### Editing template at Runtime

To modify the template you can do this:

```js
let deploy = okd.namespace('dev-665').deploy
let object = deploy.load('deploy-x', 'deploy.yml')._tmpl   //pass by reference


object.metadata.name = 'deploy-y'
deploy.post()   // we send the template with the amended field.
```

<a name="update"/>

### Update resource

To update a resource we just need to send a [json-PATCH](http://jsonpatch.com/) request.

Let's update the image of a deployment:

```js
let update = {
  op:'replace',
  path:'/spec/template/spec/containers/0/image',
  value: 'awesome:test-23'
}

let deploy = okd.namespace('dev-001').deploy

deploy.patch('awesome-app', update)
```

This will update the deployment object and automatically this change will trigger a re-deployment.


<a name="fii"/>
## Fast Template Instantiation

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

<a name="binary"/>
### Triggering a Build

For now the only way to trigger a build in using this API is by uploading a binary.

For example:

```js
function compressWorkSpace(dir, name){
    let tmp_file = name || './okd.tar.gz'
    let ret = spawn('tar', ['-Czf', tmp_file, '-C', dir, dir]) // tar the directory, forget parent
    return tmp_file
}

/* tar the workspace folder */
let file = compressWorkSpace('build.tar.gz', '~/my-nodejs-project')

okd.bc.binary(file, 'micro-1') // micro-1 should be an existing BuildConfig
.then(ok => console.log('The build has started...'))
.catch(noErrors)
```

<a name="watch"/>

### Watch

Watching is another cool feature of Kubernetes/OpenShift that allows you to listen for specific [events](https://kubernetes.io/docs/tasks/debug-application-cluster/events-stackdriver/).  

In this example we are going to trigger build to create an image and then listen when this image is finally published in the registry:

```js
okd.namespace('hello')

// Watch the build
okd.is.watch('micro-1', (event)=> {
  if (event.type === 'MODIFIED') {   // MODIFIED reports a change in this image stream.
    /* Deploy this image */
  }
})

// Trigger the build
okd.bc.binary('/workspace.tar.gz', 'micro-1') // micro-1 should be an existing BuildConfig
.then(ok => true)
.catch(noErrors)
```
