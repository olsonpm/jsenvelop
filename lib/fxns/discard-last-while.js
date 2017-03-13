//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('discardLastWhile', 2, getCollectionTypeToDiscardLastWhile);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscardLastWhile() {
  return {
    Array: discardLastWhile
    , String: discardLastWhile
  };
}

function discardLastWhile(predicate, something) {
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
