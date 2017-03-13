//
// README
// - The implementation of this method is kind of weird due to there being no
//   uniform way to determine whether a key 'exists' on a variable.  The below
//   implementation consciously lacks checks for properties on non-object types
//   which are explicitly (and confusingly) set to undefined.  This use-case
//   should either be narrow enough not to ever worry about, or non-existent.
//


//---------//
// Imports //
//---------//

const curry = require('lodash.curry');


//------//
// Main //
//------//

module.exports = curry(
  (key, obj) => {
    if (obj === undefined || obj === null) return false;

    return obj[key] !== undefined
      || (
        typeof obj === 'object'
        && key in obj
      );
  }
);
