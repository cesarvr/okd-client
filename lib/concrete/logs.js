const _ = require('lodash')
const {build_url, make_URL} = require('../tools')
const client = require('../client')

let URL = '$ENDPOINT/api/v1/namespaces/$NAMESPACE/pods/$NAME/log'

function Get(builder, name) {
  let config  = builder.get_config()
  let url     = make_URL(URL, config.cluster, config.namespace, name)
  let get     = client().Get(url, builder)

  return get
}

const set_container_name = (get, pod) => {
  if(!_.isEmpty(pod._param)) {
    get.add_query(pod._param)
  }
}

function extend(obj) {
    obj = obj || {}

    obj['pod'].container = (name) => {
      obj['pod']._param = {'container': name}

      return obj['pod']
    }

    obj['pod'].logs = (name) => {
        let get = Get(obj, name)

        set_container_name(get, obj['pod'])
        get.add_query({pretty: true})
        return get.done()
                  .then( ( {body} ) => body )
    }

    obj['pod'].stream_logs = (name, cb) => {
        let get = Get(obj, name)


        set_container_name(get, obj['pod'])
        get.add_query({follow: true})
        return get.wait_for_hour()
                  .stream(cb)
    }
}

module.exports = extend
