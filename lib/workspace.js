let fs  = require('fs')
var spawn = require('child_process').spawnSync

class File {
    constructor(){}
}

class Workspace {
    constructor(){
        this.files = fs.readdirSync('./') 
    }

    exclude(_rules) {
        this.files = this.files.filter(file => _rules.indexOf(file) === -1)

        return this 
    }

    debug(){
        console.log(this.files)
        return this
    }

    compress(name){
        this.tmp_file = name || './okd.tar.gz'
        let ret = spawn('tar', ['-czf', this.tmp_file, '-C', '.', '.']) 
          
        return this.tmp_file 
    }

    clean(){
        fs.unlinkSync(this.tmp_file)
    }
}

module.exports = Workspace
