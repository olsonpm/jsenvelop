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

module.exports = typeCaller(2, getCollectionTypeToFilter);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToFilter() {
  return {
    Map: (fn, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        if (fn(val, key, aMap)) {
          res.set(key, val);
        }
      }
      return res;
    }
    , Object: (fn, obj) => {
      const res = {};
      each(
        key => {
          if (fn(obj[key], key, obj)) {
            res[key] = obj[key];
          }
        }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (fn, arr) => {
      const res = [];
      each(
        (el, idx) => {
          if (fn(el, idx, arr)) res.push(el);
        }
        , arr
      );
      return res;
    }
    , Set: (fn, aSet) => {
      const res = new Set();
      aSet.forEach(val => {
        if (fn(val, val, aSet)) res.add(val);
      });
      return res;
    }
  };
}
