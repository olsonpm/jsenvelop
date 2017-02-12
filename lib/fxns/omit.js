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

module.exports = typeCaller(2, getCollectionTypeToOmit);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToOmit() {
  return {
    Map: (keys, aMap) => {
      validateTypeSet('keys', keys);
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!keys.has(key)) res.set(key, val);
      }
      return res;
    }
    , Object: (keys, obj) => {
      validateTypeSet('keys', keys);
      const res = {};
      Object.keys(obj).forEach(aKey => {
        if (!keys.has(aKey)) res[aKey] = obj[aKey];
      });
      return res;
    }
    , Array: (indices, arr) => {
      validateTypeSet('indices', indices);
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!indices.has(i)) res.push(arr[i]);
      }
      return res;
    }
  };
}

function validateTypeSet(argName, shouldBeSet) {
  if (type(shouldBeSet) !== 'Set') {
    throw new Error(
      `omit requires '${argName}' to have a type() equal to 'Set'`
      + `\n  type(${argName}): ` + type(shouldBeSet)
    );
  }
}
