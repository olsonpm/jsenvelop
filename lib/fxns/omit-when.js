'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToOmitWhen);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToOmitWhen() {
  return {
    Map: (predicate, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!predicate(key, val, aMap))
          res.set(key, val);
      }
      return res;
    }
    , Object: (predicate, obj) => {
      const res = {};
      Object.keys(obj).forEach(aKey => {
        if (!predicate(aKey, obj[aKey], obj))
          res[aKey] = obj[aKey];
      });
      return res;
    }
    , Array: (predicate, arr) => {
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!predicate(i, arr[i], arr)) res.push(arr[i]);
      }
      return res;
    }
  };
}
