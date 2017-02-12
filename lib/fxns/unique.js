'use strict';


//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller(1, getCollectionTypeToUnique);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToUnique() {
  return {
    Map: aMap => {
      const res = new Map()
        , valsAlreadyAdded = new Set();

      for (let [key, val] of aMap) {
        if (!valsAlreadyAdded.has(val)) {
          valsAlreadyAdded.add(val);
          res.set(key, val);
        }
      }
      return res;
    }
    , Object: obj => {
      const res = {}
        , valsAlreadyAdded = new Set();

      each(
        key => {
          const val = obj[key];
          if (!valsAlreadyAdded.has(val)) {
            valsAlreadyAdded.add(val);
            res[key] = val;
          }
        }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: arr => {
      const res = []
        , valsAlreadyAdded = new Set();

      each(
        el => {
          if (!valsAlreadyAdded.has(el)) {
            valsAlreadyAdded.add(el);
            res.push(el);
          }
        }
        , arr
      );
      return res;
    }
  };
}
