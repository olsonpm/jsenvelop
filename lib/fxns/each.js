//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('each', 2, getCollectionTypeToEach);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToEach() {
  return {
    Map: (fn, aMap) => { aMap.forEach(fn); }
    , Object: (fn, obj) => {
      arrEach(
        aKey => { fn(obj[aKey], aKey, obj); }
        , Object.keys(obj)
      );
    }
    , Array: arrEach
    , Set: (fn, aSet) => aSet.forEach(fn)
  };
}
