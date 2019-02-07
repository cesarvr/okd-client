
const _ = require('lodash')

function json_reader(){
  let self = {}
  self.is_json = (string) => string.includes('{') && string.includes('}')
  self.parse_block = function(string) {
    let closure = -1, objs = []
    self._buffer = self._buffer
    for(let i=0; i<string.length; i ++) {
      let candidate = string[i]

      if (candidate === '{') {
        if(closure < 0) self._buffer = ''
        closure = (closure < 0 )? 1 : ( closure + 1 )
      }

      if (candidate === '}') {
        closure--
      }

      if(closure === 0 && candidate === ' ')
        continue

      self._buffer += candidate

      if(closure === 0 && !_.isEmpty(self._buffer)) {
        objs.push( JSON.parse( self._buffer ) )
        self._buffer = ''
      }
    }
    return objs
  }
  return self
}

module.exports = json_reader
