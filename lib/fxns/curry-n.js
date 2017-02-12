'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry');


//------//
// Main //
//------//

const curryN = curry(
  (n, fn) => curry(fn, n)
);


//---------//
// Exports //
//---------//

module.exports = curryN;
