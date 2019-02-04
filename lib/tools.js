const countCharacters = (data, chr) => {
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




module.exports = { count: countCharacters, build_url} 
