const _ = require('lodash') 

class Store {
  constructor(){
    try{
      this.config = require('fs')
                      .readFileSync('./config.json')
                      .toString() 
      this.config = JSON.parse(this.config)
    } catch(e) {
      console.log('error: config.json not found.')
      this.config = {}
    }
  }

  commit(){
    require('fs').writeFileSync('./config.json', JSON.stringify( this.config ) )
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
