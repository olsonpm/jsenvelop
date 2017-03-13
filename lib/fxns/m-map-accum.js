//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('mMapAccum', 3, getCollectionTypeToMMapAccum);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMMapAccum() {
  return {
    Map: (fn, accum, aMap) => {
      for (let [key, val] of aMap) {
        accum = fn(accum, val, key, aMap);
        aMap.set(key, accum);
      }
      return aMap;
    }
    , Object: (fn, accum, obj) => {
      each(
        key => { accum = obj[key] = fn(accum, obj[key], key, obj); }
        , Object.keys(obj)
      );
      return obj;
    }
    , Array: (fn, accum, arr) => {
      each(
        (el, idx) => { accum = arr[idx] = fn(accum, el, idx, arr); }
        , arr
      );
      return arr;
    }
  };
}
