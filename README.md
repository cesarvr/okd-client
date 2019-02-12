## OKD Node.js Client

This Node.JS RESTful client for Kubernetes/OpenShift platform, you can use it to interact with your cluster API and this way use Javascript to automate task or perform operations.

![](https://github.com/cesarvr/hugo-blog/blob/master/static/static/gifs/okd-demo.gif?raw=true)

## Index

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
  - [Patch](#patch)
* [Shortcuts](#fii)
* [Watch](#watch)
  - [By Name](#watch_by_name)
  - [All](#watch_all)
* [Concrete Implementations](#concrete)
  - [Build Configuration](#bc)
    - [Binary Build](#binary)
  - [Pods](#pods)
    - [Logs](#logs)
* [More Examples](#examples)



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

[Namespaces](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) is a way to partition resources across your Kubernetes/OpenShift cluster. This mean that to access a particular resource such as [BuildConfig](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html) you need first need to specify the namespace.

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
  okd.pod    // OpenShift/Kubernetes pod
  okd.deploy // OpenShift/Kubernetes deployment
  okd.rs     // OpenShift/Kubernetes replica sets
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
  - [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod/)
  - [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)


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
        image: <%=image%>
        command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
        ports:
        - containerPort: 8080
```


The ``<%=name%>`` and ``<%=image%>`` are place holders that works very similar to the Javascript [template engines](https://stackoverflow.com/questions/4778881/how-to-use-underscore-js-as-a-template-engine). To publish this to the server you just need to do:

```js
  let deploy = okd.namespace('dev-665').deploy
  deploy.load({name: 'my-deployment', image:'nginx'}, 'deploy.yml').post()
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
  containers:
   image: nginx
  ...
```


### Editing template at Runtime

To modify the template you can do this:

```js
let deploy = okd.namespace('dev-665').deploy
let object = deploy.load({name: 'my-deployment', image:'nginx'}, 'deploy.yml')._tmpl   //pass by reference


object.metadata.name = 'deploy-y'
deploy.post()   // we send the template with the amended field.
```

<a name="patch"/>

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

## Shortcuts

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



<a name="watch"/>

### Watch

Watching is another cool feature of Kubernetes/OpenShift that allows you to listen for specific [events](https://kubernetes.io/docs/tasks/debug-application-cluster/events-stackdriver/).  

<a name="watch_by_name"/>

#### Watch By Name

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


<a name="watch_all"/>

#### Watch All

You also can use ``watch_all`` to listen for changes for a particular set of objects type in the cluster/namespace, each event is later delegate to an [anonymous function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#The_function_expression_(function_expression)):

```js
  okd.watch_all( (events) => {  /* events [ event 1, event 2, ... ]*/  } )
```

This function will get an array of Kubernetes [events](https://kubernetes.io/docs/reference/federation/v1/definitions/#_v1_event) as parameters reflecting any change in the cluster of those objects.

In this example we are going to listen for any changes in pods running in the ``testing`` namespace:

```js
const login = require('./lib/okd').login

function watch_test(events) {
  let type     = events[0].type
  let phase    = events[0].object.status.phase
  let pod_name = events[0].object.metadata.name

    // Only show compute pods in OKD ;)
    if(!( 'openshift.io/build.name' in annotations)  ) {
      console.log(`event type ${events[0].type} -> ${pod_name}`)
      console.log(`phase => `, phase)
    }
}

login(store.configuration) //{cluster: '****', user:'user', ...}
    .then(okd => okd.namespace('testing') // watch in testing namespace
                    .pod
                    .watch_all(watch_test))
    .catch(err => console.log('Authentication error: ', err))

```


![](https://github.com/cesarvr/hugo-blog/blob/master/static/static/gifs/global-events.gif?raw=true)


This function is also available for all supported resources.  


<a name="concrete"/>

# Concrete Implementations

Some Kubernetes/OKD objects have unique functionalities, in the case of pod for example aside from common functionalities they also implement other functions like logs, exec, etc.

<a name="bc"/>

## Build Configuration

<a name="binary"/>

### Trigger A Binary Build

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

<a name="pods"/>

## Pods

[Pods](https://kubernetes.io/docs/concepts/workloads/pods/pod/) are the building blocks for Kubernetes applications, they also expose some functionalities that can be useful:


<a name="logs"/>

### Logs

There is two options to watch pod logs first is getting the whole bulk, by using the ``pod.logs`` method:

```js
okd.pod.by_name('my-pod')
       .then(pod  => pod.metadata.name)
       .then(name => okd.pod.logs(name))
       .then(logs => console.log(logs))
```

This will return the logs for the pod ``my-pod``

```sh
npm info using npm@6.4.1
npm info using node@v10.12.0
npm info lifecycle my-app@1.0.0~prestart: my-app@1.0.0
npm info lifecycle my-app@1.0.0~start: my-app@1.0.0
> my-app@1.0.0 start /opt/app-root/src
> node app.js
```

This method give you a snapshot of the current state but you will miss further updates, to keep streaming logs in real-time you can use the ``pod.stream_logs`` method:


```js
okd.pod.stream_logs(podName, line => {
    console.log(line)    // npm info using npm@6.4.1 ...
                         // npm info using node@v10.12.0
})
```

This method keeps track of the latest logs update in the pod.


<a name="examples"/>

## More Examples

Let's make a robot that monitors the logs of any running pod in our namespace including builds (*which in essence are just other type of pods*).

```js
const login = require('./lib/okd').login


function watch_bot(okd, name) {
    let pending = {}

    // Closure that will
    return function(events) {
        // for more info about event object -->
        //https://kubernetes.io/docs/reference/federation/v1/definitions/#_v1_event
        let annotations = events[0].object.metadata.annotations
        let labels = events[0].object.metadata.labels
        let phase = events[0].object.status.phase
        let pod_name = events[0].object.metadata.name

        // Capture pods transitioning from Pending to Running.
        // This means being deployed...
        if(phase === 'Pending') {
            console.log(`event type ${events[0].type} -> ${pod_name}`)
            console.log(`phase => `, events[0].object.status.phase)

            pending[pod_name] = true
        }

        // If the pod goes from Pending to Running...
        // ... We show the logs.
        if(phase === 'Running' && pending[pod_name]) {
            console.log('\033[2J')  // clear screen...
            console.log('pod: ', pod_name)
            console.log('================================')

            // Watch the logs for this pod: pod_name
            okd.pod.stream_logs(pod_name, (logs)=> {
              // We read the logs and print the logs...
              process.stdout.write(logs)
            })
            pending[pod_name] = false
        }
    }
}

login(store.configuration) //{cluster: '****', user:'user', ...}
    .then(okd => okd.namespace('testing') // watch in testing namespace
                    .pod
                    .watch_all(watch_bot(okd, 'test'))
    .catch(err => console.log('Authentication error: ', err))
```
