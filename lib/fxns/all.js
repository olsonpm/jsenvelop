//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('all', 2, getCollectionTypeToAll);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToAll() {
  return {
    Object: (predicate, obj) => {
      const keys = Object.keys(obj);

      let stillTruthy = true
        , i = 0;

      while (stillTruthy && i < keys.length) {
        let aKey = keys[i];
        stillTruthy = predicate(obj[aKey], aKey, obj);
        i += 1;
      }

      return stillTruthy;
    }
    , Map: (predicate, aMap) => {
      let stillTruthy = true;
      for (let [key, val] of aMap) {
        stillTruthy = predicate(val, key, aMap);
        if (!stillTruthy) break;
      }
      return stillTruthy;
    }
    , Array: (predicate, arr) => {
      let stillTruthy = true
        , i = 0;

      while (stillTruthy && i < arr.length) {
        stillTruthy = predicate(arr[i], i, arr);
        i += 1;
      }

      return stillTruthy;
    }
    , Set: (predicate, aSet) => {
      let stillTruthy = true
        , i = 0;
      for (let val of aSet) {
        stillTruthy = predicate(val, i, aSet);
        i += 1;
        if (!stillTruthy) break;
      }
      return stillTruthy;
    }
  };
}
