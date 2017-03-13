//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('take', 2, getCollectionTypeToTake);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToTake() {
  const take = (num, coll) => coll.slice(0, num);
  return {
    String: take
    , Array: take
  };
}
