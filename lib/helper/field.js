class Field {
    constructor(obj) {
        this.data = {}
        this.obj = obj
    }

    protect(key, errorMessage) {
        Object.defineProperty( this.obj, key, {
            set: (v) => {
                this.data[key] = v
            },
            get: () => { 
                if(this.data[key] === null) { 
                    console.warn(`Warning: ${errorMessage}`) 
                    throw `Error: ${errorMessage}`
                } 

                return this.data[key]
            }
        })
        return this 
    }

    get object () { 
        return this.obj 
    }
}

module.exports = Field 
