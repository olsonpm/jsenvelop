//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('map', 2, getCollectionTypeToMap);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMap() {
  return {
    Map: (fn, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        res.set(key, fn(val, key, aMap));
      }
      return res;
    }
    , Object: (fn, obj) => {
      const res = {};
      each(
        key => { res[key] = fn(obj[key], key, obj); }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (fn, arr) => {
      const res = [];
      each(
        (el, idx) => { res[idx] = fn(el, idx, arr); }
        , arr
      );
      return res;
    }
  };
}
