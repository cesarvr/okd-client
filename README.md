## OKD Node.js Client

This Node.JS RESTful client API for Kubernetes/OpenShift. This library helps you use JavaScript to write simple programs to automate things like deploy images, listen for cluster events, [build/create containers](#binary) (OpenShift only at the moment), watch push/pull images etc. Or more sophisticated things like send me an email/slack message if a particular pod crash.

## Index

* [Installing](#install)
* [Login](#login)
* [Initialize With Token](#token)
* [Select Namespace](#ns)
* [Components](#res)
* [CRUD](#common)
  - [Find All](#all)
  - [Find By Name](#by_name)
  - [Remove](#remove)
  - [Create](#create)
  - [Template](#template)
    - [Faster Template](#fii)
  - [Patch](#patch)
  - [Update](#update)
* [Watch](#watch)
  - [All](#watch_all)
* [Concrete Implementations](#concrete)
  - [Build Configuration](#bc)
    - [Binary Build](#binary)
  - [Pods](#pods)
    - [Logs](#logs)
* [Bot Example](#examples)

<a name="install"/>

### Installing

```sh
  npm i okd-api
```

```js
const { login, okd } = require('okd-api')
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
    .then(okd => /* do something... */)
    .catch(err => /* auth failed... */)
```

The login function receive an configuration following object:

 - **cluster** Kubernetes server URL.
 - **user, password**  Your user and password.
 - **strictSSL** Some implementations like [Minishfit](https://github.com/minishift/minishift) use a self-signed SSL certificate which trigger a security warning for https clients, is that your case turn this to false.  

The login functions returns an ``okd`` object after it finish the authentication with the server, the ``okd`` object is the one in charge of to talk against the API server.

<a name="token"/>

#### With Token

If you already have a token (because you previously acquired one through authentication) you can provide the cluster URL and the token.

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


#### Retrieve Token

Once the client login with the server you receive an OAuth token to get this token and other information by calling the ``config`` method.

```js
 okd.config( opts => {
   console.log(opts)
   /* {  namespace: '....',
         cluster: '....',
         token: '....',
         strictSSL: true || false
       } */
 })
```

<a name="res"/>

### Components

This are the objects supported at the moment:

- OpenShift  
  - [ImageStream](https://docs.openshift.com/enterprise/3.0/architecture/core_concepts/builds_and_image_streams.html)
  - [BuildConfig](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html)
  - [Build](https://docs.openshift.com/container-platform/3.9/dev_guide/builds/index.html)
  - [DeploymentConfig](https://docs.openshift.com/enterprise/3.0/dev_guide/deployments.html)
  - [Router](https://docs.openshift.com/container-platform/3.9/install_config/router/index.html)
  - [Project](https://docs.openshift.com/container-platform/3.7/dev_guide/projects.html) *Requires Admin*

- Kubernetes
  - [Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
  - [Service](https://kubernetes.io/docs/concepts/services-networking/service/)
  - [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod/)
  - [ReplicaSet](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
  - [Namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) *Require Admin*


To access those elements like this:

  ```js
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



---

<a name="common"/>

## CRUD

Each of this objects support a common set of functionalities which are related to the basic HTTP REST verbs. Let's talk in more detail about those functions.

<a name="all"/>

### Find All

Returns a promise which resolve in the future with a list of all the objects of a particular type.


```js
  // Returns a promise with all imagestreams in the namespace dev-655.
  okd.namespace('dev-665')
     .is
     .all()      


  // All Services
  okd.namespace('dev-1')
     .svc
     .all()
```

<a name="by_name"/>

### By Name

You can also find resources by name:

```js
  okd.namespace('dev-665')
     .is
     .by_name('nodejs-image')
```
Returns Imagestream called `nodejs-image`.


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

Objects in Kubernetes are defined using a templates like this one:

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

This is what a Deployment looks like, this API support template parameters that helps you create reusable templates, in this example we can replace the ``<%=name%>`` and ``<%=image%>`` placeholders with actual information like this:

```js
  let deploy = okd.namespace('dev-665')
                  .deploy

  deploy.load({name: 'my-deployment', image:'nginx'}, 'deploy.yml')
        .post()
```

This code push to the server a Deployment object with the following shape:  

```xml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: my-deployment
  labels:
    app: my-deployment
spec:
  replicas: 1
  ...
  containers:
   image: nginx
  ...
```


### Editing template at Runtime

To modify the template at run-time you can do the following:

```js
let deploy = okd.namespace('dev-665').deploy
let object = deploy.load({name: 'my-deployment', image:'nginx'}, 'deploy.yml')._tmpl   //pass by reference


object.metadata.name = 'deploy-y'
deploy.post()   // we send the template with the amended field.
```


<a name="fii"/>

### Faster Template

Template operations above can be done faster by using this shortcut:

```js
  okd.namespace('dev-003')
  okd.from_template(this.appName,'./tmpl/imagestream.yml').post()
```

**from_template** will auto-detect the type of template you try to use and if its supported you can perform the actions for example:

```js
  let deploy = okd.from_template(this.appName,'./tmpl/deployment.yml')
```

If ``deployment.yml`` is a valid Deployment template it will return an ``okd.deploy`` object, equivalent to something like this:


```js
let deploy = okd.deploy
```

The difference is that the information about the deployment is encapsulated inside the object, allowing you act over the object.

```js
  //['tmpl0.yml','tmpl1.yml', 'tmpl2.yml'... ]
  let objs = ['./deploy.yml','pod.yml', 'route.yml' ]
                .map(tmpl => okd.from_template(tmpl))

  // create all
    objs.forEach(obj => obj.create())


  //delete all
    objs.forEach(obj => obj.remove())    
```

<a name="update"/>

### Update

To update a Kubernetes component such as Deployment you can use the ``put`` or ``update`` method, this method fetch a copy of the actual resource from the server and apply a merge, for example:

Let's assume an imaginary object ``A`` is in the cloud:

```js
 A {
     a:1,
     b:2,
     c:3,
     d: { e: 5  }
   }
```

To update the ``e``  property to **1** we can do:

```js
 okd.Atype.put( { b: {e: 1 } })
   .then(ok =>  /* success */ )
```

After we execute this command we should get this:

```js
 A {
     a:1,
     b:2,
     c:3,
     d: { e: 1  }
   }
```


In the following example we are going to update a Deployment controller ``test`` to 3 replicas.

```js
login(store.configuration)
    .then(okd => {
        okd.namespace('hello')
        okd.config((conf) => store.save(conf))
        return okd.deploy.put('test', {spec: { replicas: 3 }})
    })
    .then(  ok => console.log('update->', ok))
    .catch(err => console.log('failing: ', err))
```

<a name="patch"/>

### Patch

Another way to update Kubernetes object is to use the ``patch`` method, this method requires the [json-PATCH](http://jsonpatch.com/) protocol, for example:

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


---

<a name="watch"/>

### Watch

Kubernetes/OpenShift uses an [event](https://kubernetes.io/docs/tasks/debug-application-cluster/events-stackdriver/) system to keep track of changes in the cluster, we can listen to this changes individually using the ``watch`` function.     

```js
  okd.okd_object.watch(name, event => {})
```
  - **name** The name of the object we want to listen for state change.

  - ``event => `` A function that receives Kubernetes [events](https://kubernetes.io/docs/reference/federation/v1/definitions/#_v1_event).



The *event* have the form of:

```js
{
  type: "MODIFIED",  /* DELETE, ADDED */
  object: {
    kind: "Service",
    apiVersion: "v1",
    /*...*/
  }
}
```

Type define the action and object is basically a [Kubernetes/OKD](#res) object definition.



#### Usage Example

```js
okd.namespace('hello')

// Watch for new builds
okd.is.watch('micro-1', (event)=> {
  if (event.type === 'MODIFIED') {   
    // Deploy this image to ...
  }
})

// Watch for for actions in this pod
okd.pod.watch('nginx-prod', (event)=> {
  if (event.type === 'DELETED') {  
    // Call emergency...
  }
})

```


<a name="watch_all"/>

### Watching All Objects

Or we can watch them all using the ``watch_all`` function, and listen any events in the ``namespace`` for a particular object type.

```js
  okd.resource.watch_all( (events) => {  /* events [ event 1, event 2, ... ]*/  } )
```

This function receives array of [events](https://kubernetes.io/docs/reference/federation/v1/definitions/#_v1_event) as parameters. To watch the pods running we can do this:


```js
const login = require('okd-api').login

login(store.configuration) //{cluster: '****', user:'user', ...}
    .then(okd => okd.namespace('testing') // watch in testing namespace
                    .pod
                    .watch_all(watch_test))
    .catch(err => console.log('Authentication error: ', err))

```


We call a ``watch_all`` function a pass a function called ``watch_test`` this function should have the following signature:

```js

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

```


Contrary to the cases above, here should use a callback because we are dealing with a stateful connection which will remain as long as the timeout limit establish by the cluster administrator. The event type is similar to the one we used above.


![](https://github.com/cesarvr/hugo-blog/blob/master/static/static/gifs/global-events.gif?raw=true)


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

If you are running multiple containers in a single *pod* then you can target that container using function ``container`` like this:

```js
okd.namespace('dev-0')
             .pod
             .container('ftp-server')
             .logs('static-files-pod')
             .then(logs => {
                /* Read the logs */
             })
```

<a name="examples"/>

## Writing A Bot

Let's build a bot that fetch the logs of any container that is being deploying in our cluster, this can be interesting to follow the stages of an applications from building, testing and execution from one place.  

### Login

```js
const { login } = require('okd-api')

login(store.configuration) // {cluster: '****', user:'user', ...}
    .then(okd => okd.namespace('testing')
                    .pod
                    .watch_all( pods => // pods events )
         )
    .catch(err => console.log('Authentication error: ', err))
```


We have done the login and we setup the watch for the namespace ``testing`` next we need to create a function that watch and capture the transition of pods from ``Pending`` to ``Running``.


```js

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

```

This function does just that it just listen for pods doing the transitions and then we finally use the ``pod.stream_logs`` to retrieve the logs from the targeted pod. If we run this program we are going to get something like this:

![](https://github.com/cesarvr/hugo-blog/blob/master/static/static/gifs/logs.gif?raw=true)
