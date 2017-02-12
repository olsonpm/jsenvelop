'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToDropWhile);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDropWhile() {
  return {
    Array: dropWhile
    , String: dropWhile
  };
}

function dropWhile(predicate, something) {
  let i = 0
    , keepDropping = true;

  while (keepDropping && i < something.length) {
    keepDropping = predicate(something[i]);
    if (keepDropping) i += 1;
  }

  return something.slice(i);
}
