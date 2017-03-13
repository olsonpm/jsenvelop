//---------//
// Imports //
//---------//

const _arrEach = require('./_arr-each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('mapKeys', 2, getCollectionTypeToMapKeys);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMapKeys() {
  return {
    Map: (fn, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        res.set(fn(key, val, aMap), val);
      }
      return res;
    }
    , Object: (fn, obj) => {
      const res = {};
      _arrEach(
        key => { res[fn(key, obj[key], obj)] = obj[key]; }
        , Object.keys(obj)
      );
      return res;
    }
  };
}
