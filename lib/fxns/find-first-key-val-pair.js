//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToFindFirstKeyValPair);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToFindFirstKeyValPair() {
  return {
    Object: (predicate, obj) => {
      const keys = Object.keys(obj);

      let found = false
        , i = 0
        , res;

      while (!found && i < keys.length) {
        let aKey = keys[i];

        found = predicate(obj[aKey], aKey, obj);
        if (found) {
          res = [aKey, obj[aKey]];
        }

        i += 1;
      }

      return res;
    }
    , Map: (predicate, aMap) => {
      let res;
      for (let [key, val] of aMap) {
        if (predicate(val, key, aMap)) {
          res = [key, val];
          break;
        }
      }
      return res;
    }
    , Array: (predicate, arr) => {
      let found = false
        , i = 0
        , res;

      while (!found && i < arr.length) {
        found = predicate(arr[i], i, arr);
        i += 1;
      }

      if (found) res = [i - 1, arr[i - 1]];

      return res;
    }
  };
}
