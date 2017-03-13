//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('keys', 1, getCollectionTypeToArrayOfKeys);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToArrayOfKeys() {
  return {
    Object: obj => Object.keys(obj)
    , Map: aMap => [...aMap.keys()]
  };
}
