const cout_chrs = (data, chr) => {
   let counter = chr.reduce((acc, next) =>{ acc[next] = 0; return acc }, {})

   for(let i =0; i<data.length; i++){
    let idx = chr.indexOf( data[i] )
    if( idx >= 0 ) {
        counter[chr[idx]] = counter[chr[idx]] || 0
        counter[chr[idx]]+= 1
    }
   }
   return counter
}

function build_url(key, URLS) {
    return (cluster, namespace) => {
        let str = URLS[key]
        cluster = cluster.replace('https://', '')
        str = str.replace('$ENDPOINT', cluster)
        str = str.replace('$NAMESPACE', namespace)
        return str
    }
}

function is_json_object(strings) {
    let cnt = cout_chrs(strings, ['{', '}'])
    if ( cnt['{'] === 0 && cnt['}'] === 0 )
      return false
    return cnt['{'] === cnt['}']
}

function cluster_address(str) {

    str = str.replace(/\/$/, "")

    if(str.indexOf('http:') !== -1) {
      return str.replace('http', 'https')
    }

    if(str.indexOf('https://') < 0)
      str = `https://${str}`
    return str
}

function replace_placeholders(URL, opts) {
        let str = URL

        Object.keys(opts).forEach(key => {
          str = str.replace(key, opts[key])
        })

        return str
}

function make_URL(URL, cluster, namespace, name) {
  return replace_placeholders(URL, {
    '$ENDPOINT': cluster,
    '$NAMESPACE': namespace,
    '$NAME': name
  })
}

module.exports = { count: cout_chrs, build_url, is_json_object, cluster_address, replace_placeholders, make_URL}
