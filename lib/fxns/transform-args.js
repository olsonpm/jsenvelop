//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , transform = require('./transform')
  ;


//------//
// Main //
//------//

module.exports = curry(
  (objOfTransforms, fn) => curry(
    (...args) => fn(...transform(objOfTransforms, args))
    , objOfTransforms.arity || fn.length
  )
);
