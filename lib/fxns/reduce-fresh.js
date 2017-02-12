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

module.exports = typeCaller(3, getCollectionTypeToReduceFresh);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReduceFresh() {
  return {
    Map: (fn, getFreshRes, aMap) => {
      let res = getFreshRes();
      for (let [key, val] of aMap) {
        res = fn(res, val, key, aMap);
      }
      return res;
    }
    , Object: (fn, getFreshRes, obj) => {
      let res = getFreshRes();
      each(
        key => { res = fn(res, obj[key], key, obj); }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (fn, getFreshRes, arr) => {
      let res = getFreshRes();
      each(
        (el, idx) => { res = fn(res, el, idx, arr); }
        , arr
      );
      return res;
    }
    , Set: (fn, getFreshRes, aSet) => {
      let res = getFreshRes();
      for (let val of aSet) {
        res = fn(res, val, val, aSet);
      }
      return res;
    }
  };
}
