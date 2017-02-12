'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , reduce = require('./reduce')
  ;


//------//
// Main //
//------//

module.exports = curry(
  (fnArr, arg) => reduce(
    (innerArg, fn) => fn(innerArg)
    , arg
    , fnArr
  )
);
