'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToDropRightWhile);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDropRightWhile() {
  return {
    Array: dropRightWhile
    , String: dropRightWhile
  };
}

function dropRightWhile(predicate, something) {
  let i = 0
    , keepDropping = true
    , lastIdx = something.length - 1
    ;

  while (keepDropping && i <= lastIdx) {
    keepDropping = predicate(something[lastIdx - i]);
    if (keepDropping) i += 1;
  }

  return something.slice(0, something.length - i);
}
