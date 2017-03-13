//---------//
// Imports //
//---------//

const findFirstTypeToReturnVal = require('./_find-first-type-to-return-val');


//------//
// Main //
//------//

module.exports = type => {
  const getReturnVal = findFirstTypeToReturnVal[type]
    , indexedFindFirst = getIndexedFindFirst(getReturnVal)
    ;

  return () => ({ // collection type mapper consumed by type-caller.js
    Map: (fn, aMap) => {
      let fnResult, valResult;

      for (let [key, val] of aMap) {
        fnResult = fn(val, key, aMap);
        if (fnResult) {
          valResult = val;
          break;
        }
      }

      return getReturnVal(fnResult, valResult);
    }
    , Array: indexedFindFirst
    , String: indexedFindFirst
    , Set: (fn, aSet) => {
      let fnResult, valResult;

      for (let val of aSet) {
        fnResult = fn(val, val, aSet);
        if (fnResult) {
          valResult = val;
          break;
        }
      }

      return getReturnVal(fnResult, valResult);
    }
  });
};


//-------------//
// Helper Fxns //
//-------------//

function getIndexedFindFirst(getReturnVal) {
  return (fn, strOrArray) => {
    let i = 0
      , result
      ;

    while (!result && i < strOrArray.length) {
      result = fn(strOrArray[i], i, strOrArray);
      i += 1;
    }

    return getReturnVal(result, strOrArray[i-1]);
  };
}
