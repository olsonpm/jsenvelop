//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('shallowClone', 1, getCollectionTypeToShallowClone);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToShallowClone() {
  return {
    Map: aMap => new Map(aMap)
    , Object: obj => {
      const res = {};
      arrEach(
        key => { res[key] = obj[key]; }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: arr => arr.slice()
    , Set: aSet => new Set(aSet)
  };
}
