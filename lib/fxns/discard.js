'use strict';


//---------//
// Imports //
//---------//

const type = require('./type')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToDiscard);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscard() {
  return {
    Map: (vals, aMap) => {
      validateTypeSet(vals);
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!vals.has(val)) res.set(key, val);
      }
      return res;
    }
    , Object: (vals, obj) => {
      validateTypeSet(vals);
      const res = {};
      Object.keys(obj).forEach(aKey => {
        if (!vals.has(obj[aKey])) res[aKey] = obj[aKey];
      });
      return res;
    }
    , Array: (vals, arr) => {
      validateTypeSet(vals);
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!vals.has(arr[i])) res.push(arr[i]);
      }
      return res;
    }
    , Set: (vals, aSet) => {
      validateTypeSet(vals);
      const res = new Set();
      for (let aVal of aSet) {
        if (!vals.has(aVal)) res.add(aVal);
      }
      return res;
    }
  };
}

function validateTypeSet(shouldBeSet) {
  if (type(shouldBeSet) !== 'Set') {
    throw new Error(
      `discard requires 'vals' to have a type() equal to 'Set'`
      + `\n  type(vals): ` + type(shouldBeSet)
    );
  }
}
