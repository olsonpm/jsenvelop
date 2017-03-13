//---------//
// Imports //
//---------//

const each = require('./each')
  , head = require('./head')
  , tail = require('./tail')
  , typeCaller = require('./type-caller')
  ;

const { eachOffset } = require('./utils');


//------//
// Main //
//------//

module.exports = typeCaller('reduceFirst', 2, getCollectionTypeToReduceFirst);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReduceFirst() {
  return {
    Map: (fn, aMap) => {
      const iter = aMap.entries();
      let [,res] = iter.next().value;

      for (let [key, val] of iter) {
        res = fn(res, val, key, aMap);
      }

      return res;
    }
    , Object: (fn, obj) => {
      const objKeys = Object.keys(obj);
      let res = obj[head(objKeys)];

      each(
        key => {
          res = fn(res, obj[key], key, obj);
        }
        , tail(objKeys)
      );

      return res;
    }
    , Array: (fn, arr) => {
      let res = head(arr);
      eachOffset(
        (el, idx) => {
          res = fn(res, el, idx, arr);
        }
        , arr
        , 1
      );
      return res;
    }
    , Set: (fn, aSet) => {
      const iter = aSet.values();
      let res = iter.next().value;

      for (let val of iter) {
        res = fn(res, val, val, aSet);
      }
      return res;
    }
  };
}
