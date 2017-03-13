//---------//
// Imports //
//---------//

const mMap = require('./m-map')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('toPairs', 1, getCollectionTypeToToPairs);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToToPairs() {
  return {
    Object: obj => mMap(
      aKey => [aKey, obj[aKey]]
      , Object.keys(obj)
    )
    , Map: aMap => [...aMap.entries()]
  };
}
