//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , hasKey = require('./has-key')
  ;


//------//
// Main //
//------//

module.exports = curry(
  (key, obj) => hasKey(key, obj)
    ? obj[key]
    : undefined
);
