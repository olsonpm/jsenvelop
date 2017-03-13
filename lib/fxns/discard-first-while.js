//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('discardFirstWhile', 2, getCollectionTypeToDiscardFirstWhile);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscardFirstWhile() {
  return {
    Array: discardFirstWhile
    , String: discardFirstWhile
  };
}

function discardFirstWhile(predicate, something) {
  let i = 0
    , keepDropping = true;

  while (keepDropping && i < something.length) {
    keepDropping = predicate(something[i]);
    if (keepDropping) i += 1;
  }

  return something.slice(i);
}
