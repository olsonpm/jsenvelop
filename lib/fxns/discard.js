//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , toSet = require('./_to-set')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('discard', 2, getCollectionTypeToDiscard);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToDiscard() {
  return {
    Map: (vals, aMap) => {
      vals = toSet(vals);
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!vals.has(val)) res.set(key, val);
      }
      return res;
    }
    , Object: (vals, obj) => {
      vals = toSet(vals);
      const res = {};
      arrEach(
        aKey => {
          if (!vals.has(obj[aKey])) res[aKey] = obj[aKey];
        }
        , Object.keys(obj)
      );

      return res;
    }
    , Array: (vals, arr) => {
      vals = toSet(vals);
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!vals.has(arr[i])) res.push(arr[i]);
      }
      return res;
    }
    , Set: (vals, aSet) => {
      vals = toSet(vals);
      const res = new Set();
      for (let aVal of aSet) {
        if (!vals.has(aVal)) res.add(aVal);
      }
      return res;
    }
  };
}
