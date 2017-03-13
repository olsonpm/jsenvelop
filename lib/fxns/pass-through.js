//---------//
// Imports //
//---------//

const reduce = require('./reduce');


//------//
// Main //
//------//

module.exports = (arg, fnArr) => reduce(
  (innerArg, fn) => fn(innerArg)
  , arg
  , fnArr
);
