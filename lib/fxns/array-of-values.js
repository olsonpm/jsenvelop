//---------//
// Imports //
//---------//

const mMap = require('./m-map')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('arrayOfValues', 1, getCollectionTypeToArrayOfValues);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToArrayOfValues() {
  return {
    Object: obj => mMap(
      aKey => obj[aKey]
      , Object.keys(obj)
    )
    , Map: aMap => [...aMap.values()]
    , Array: x => x
    , Set: aSet => [...aSet]
  };
}
