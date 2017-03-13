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

module.exports = typeCaller('omit', 2, getCollectionTypeToOmit);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToOmit() {
  return {
    Map: (keys, aMap) => {
      keys = toSet(keys);
      const res = new Map();
      for (let [key, val] of aMap) {
        if (!keys.has(key)) res.set(key, val);
      }
      return res;
    }
    , Object: (keys, obj) => {
      keys = toSet(keys);
      const res = {};
      arrEach(
        aKey => {
          if (!keys.has(aKey)) res[aKey] = obj[aKey];
        }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (indices, arr) => {
      indices = toSet(indices);
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        if (!indices.has(i)) res.push(arr[i]);
      }
      return res;
    }
  };
}
