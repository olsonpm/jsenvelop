//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('mMap', 2, getCollectionTypeToMMap);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMMap() {
  return {
    Map: (fn, aMap) => {
      for (let [key, val] of aMap) {
        aMap.set(key, fn(val, key, aMap));
      }
      return aMap;
    }
    , Object: (fn, obj) => {
      each(
        key => { obj[key] = fn(obj[key], key, obj); }
        , Object.keys(obj)
      );
      return obj;
    }
    , Array: (fn, arr) => {
      each(
        (el, idx) => { arr[idx] = fn(el, idx, arr); }
        , arr
      );
      return arr;
    }
  };
}
