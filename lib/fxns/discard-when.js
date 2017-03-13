//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , keepWhen = require('./keep-when')
  , not = require('./_not')
  ;


//------//
// Main //
//------//

module.exports = curry(
  (fn, something) => keepWhen(not(fn), something)
);
