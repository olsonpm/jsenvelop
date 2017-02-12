//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToAny);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToAny() {
  return {
    Object: (predicate, obj) => {
      const keys = Object.keys(obj);

      let found = false
        , i = 0;

      while (!found && i < keys.length) {
        let aKey = keys[i];

        found = predicate(obj[aKey], aKey, obj);

        i += 1;
      }

      return found;
    }
    , Map: (predicate, aMap) => {
      let found = false;
      for (let [key, val] of aMap) {
        found = predicate(val, key, aMap);
        if (found) break;
      }
      return found;
    }
    , Array: (predicate, arr) => {
      let found = false
        , i = 0;

      while (!found && i < arr.length) {
        found = predicate(arr[i], i, arr);
        i += 1;
      }

      return found;
    }
    , Set: (predicate, aSet) => {
      let found = false;
      for (let val of aSet) {
        found = predicate(val, aSet);
        if (found) break;
      }
      return found;
    }
  };
}
