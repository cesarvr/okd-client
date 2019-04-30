const _ = require('lodash')

function create(parent, child) {
    
    if(!_.isObject(parent) || !_.isObject(child) ) 
        Throw 'Error: Making OKD Object, empty template'
}

module.exports = create 
