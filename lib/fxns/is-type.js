//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , type = require('./type')
  ;

//------//
// Main //
//------//

module.exports = curry((aType, val) => type(val) === aType);
