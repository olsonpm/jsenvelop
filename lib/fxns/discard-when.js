'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToDiscardWhen);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscardWhen() {
  return {
    Map: (predicate, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!predicate(val, key, aMap))
          res.set(key, val);
      }
      return res;
    }
    , Object: (predicate, obj) => {
      const res = {};
      Object.keys(obj).forEach(aKey => {
        if (!predicate(obj[aKey], aKey, obj))
          res[aKey] = obj[aKey];
      });
      return res;
    }
    , Array: (predicate, arr) => {
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!predicate(arr[i], i, arr))
          res.push(arr[i]);
      }
      return res;
    }
    , Set: (predicate, aSet) => {
      const res = new Set();
      for (let aVal of aSet) {
        if (!predicate(aVal, aSet))
          res.add(aVal);
      }
      return res;
    }
  };
}
