
const _ = require('lodash')
const { is_json_object } = require('../tools')


function json_reader() {
  let self = {}

  self.read = function(str) {
    let ret = str.split('\n')
    return ret.filter( blk => blk !== '' && is_json_object(blk) )
              .map(blk =>  JSON.parse(blk))
  }

  self.remove_readed = function(str){
    return str.split('\n')
              .filter(blk => !is_json_object(blk))
              .pop()
              .trim()
  }

  return self
}

module.exports = json_reader
