const count = (data, chr) => {
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

module.exports = { count } 
