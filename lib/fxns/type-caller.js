'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , curryN = require('./curry-n')
  , type = require('./type')
  ;


//------//
// Init //
//------//

// avoid circular references by copy/pasting
const last = arr => arr[arr.length - 1]
  , is = getIs()
  ;


//------//
// Main //
//------//

module.exports = (numArgs, getCollectionTypeMapper) =>
  curryN(
    numArgs
    , (...args) => {
      const collectionTypeMapper = getCollectionTypeMapper()
        , fn = collectionTypeMapper[type(last(args.slice(0, numArgs)))]
        ;

      if (!is(Function, fn)) {
        throw new Error(
          "invalid type passed"
          + "\n  last arg type: " + type(last(args))
          + "\n  types allowed: " + Object.keys(collectionTypeMapper).join(', ')
        );
      }

      return fn(...args);
    }
  );


//-------------//
// Helper Fxns //
//-------------//

//
// slightly different from utils -> `is` since I don't feel like copy/pasting
//   all its functions nor extracting them out to separate files.  Bugs might
//   arise from that lazyness, but they're my bugs.
//
function getIs() {
  return curry(
    (Ctor, val) => (
      (
        val !== null
        && val !== undefined
        && val.constructor === Ctor
      )
      || val instanceof Ctor
    )
  );
}
