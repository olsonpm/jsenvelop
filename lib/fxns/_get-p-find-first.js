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
    Map: async (pFn, aMap) => {
      let fnResult, valResult;

      for (let [key, val] of aMap) {
        fnResult = await pFn(val, key, aMap);
        if (fnResult) {
          valResult = val;
          break;
        }
      }

      return getReturnVal(fnResult, valResult);
    }
    , Array: indexedFindFirst
    , String: indexedFindFirst
    , Set: async (pFn, aSet) => {
      let fnResult, valResult;

      for (let val of aSet) {
        fnResult = await pFn(val, val, aSet);
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
  return async (pFn, strOrArray) => {
    let i = 0
      , result
      ;

    while (!result && i < strOrArray.length) {
      result = await pFn(strOrArray[i], i, strOrArray);
      i += 1;
    }

    return getReturnVal(result, strOrArray[i-1]);
  };
}
