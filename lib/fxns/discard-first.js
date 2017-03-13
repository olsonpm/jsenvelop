//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('discardFirst', 2, getCollectionTypeToDiscardFirst);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscardFirst() {
  const discardFirst = (num, coll) => coll.slice(num);
  return {
    String: discardFirst
    , Array: discardFirst
  };
}
