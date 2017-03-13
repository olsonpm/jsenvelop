//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , not = require('./_not')
  , pickWhen = require('./pick-when')
  ;


//------//
// Main //
//------//

module.exports = curry((predicate, coll) => pickWhen(not(predicate), coll));
