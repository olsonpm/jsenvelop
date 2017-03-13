//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('discardLast', 2, getCollectionTypeToDiscardLast);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscardLast() {
  const discardLast = (num, coll) => coll.slice(0, -num);
  return {
    String: discardLast
    , Array: discardLast
  };
}
