//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('keepFirst', 2, getCollectionTypeToKeepFirst);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToKeepFirst() {
  const keepFirst = (num, coll) => coll.slice(0, num);
  return {
    String: keepFirst
    , Array: keepFirst
  };
}
