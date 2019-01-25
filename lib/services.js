const fs = require('fs')
const _ = require('lodash')
const yaml = require('yamljs')



let templates = {
    'build':'build.yml',
    'imagestream': 'imagestream.yml'
}

class Resources {
    endpoints({cluster, namespace, name}) {
        return {
            imagestream:`${cluster}/apis/image.openshift.io/v1/namespaces/${namespace}/imagestreams`,
            service: `${cluster}/api/v1/namespaces/${namespace}/services`,
            build: `${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs`,
            binary:`${cluster}/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs/${name}/instantiatebinary`,
            route: `${cluster}/apis/route.openshift.io/v1/namespaces/${namespace}/routes`,
        }
    }
}

function load_template(file, {name, namespace}){
    console.log('open file ', file)
  if(file === undefined) return {}
  let yml_raw = fs.readFileSync(`./tmpl/${file}`).toString()
  let compiled = _.template(yml_raw)

  let template = JSON.stringify(
                   yaml.parse(
                        compiled({name, namespace})
                   )
                 )

  return template
}

module.exports = (okdResource) => {
    return new OkdTemplate(okdResource)
}
