'use strict';


//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller(3, getCollectionTypeToReduce);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReduce() {
  return {
    Map: (fn, res, aMap) => {
      for (let [key, val] of aMap) {
        res = fn(res, val, key, aMap);
      }
      return res;
    }
    , Object: (fn, res, obj) => {
      each(
        key => { res = fn(res, obj[key], key, obj); }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (fn, res, arr) => {
      each(
        (el, idx) => { res = fn(res, el, idx, arr); }
        , arr
      );
      return res;
    }
    , Set: (fn, res, aSet) => {
      for (let val of aSet) {
        res = fn(res, val, val, aSet);
      }
      return res;
    }
  };
}
