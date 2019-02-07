const _ = require('lodash') 

class Store {
  constructor(config){
    try{
      this.file = config || './config.json'
      this.config = require('fs')
                      .readFileSync( this.file )
                      .toString() 

      this.config = JSON.parse(this.config)
    } catch(e) {
      console.log('error: config.json not found.')
      this.config = {}
    }
  }

  commit(){
    require('fs').writeFileSync(this.file, JSON.stringify( this.config ) )
  }

  save(obj) {
    this.config = _.merge(this.config, obj)
    this.commit()
  }
  
  credentials(){
    return {user: this.config.user, password: this.config.password}
  }

  get configuration() {
    return this.config
  }
}


module.exports = Store
