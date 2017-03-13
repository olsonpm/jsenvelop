//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('uniqueById', 2, getCollectionTypeToUniqueById);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToUniqueById() {
  return {
    Map: (idFn, aMap) => {
      const res = new Map()
        , idsAlreadyAdded = new Set();

      for (let [key, val] of aMap) {
        const id = idFn(val, key, aMap);
        if (!idsAlreadyAdded.has(id)) {
          idsAlreadyAdded.add(id);
          res.set(key, val);
        }
      }
      return res;
    }
    , Object: (idFn, obj) => {
      const res = {}
        , idsAlreadyAdded = new Set();

      each(
        key => {
          const val = obj[key]
            , id = idFn(val, key, obj);

          if (!idsAlreadyAdded.has(id)) {
            idsAlreadyAdded.add(id);
            res[key] = val;
          }
        }
        , Object.keys(obj)
      );
      return res;
    }
    , Array: (idFn, arr) => {
      const res = []
        , idsAlreadyAdded = new Set();

      each(
        (el, idx) => {
          const id = idFn(el, idx, arr);
          if (!idsAlreadyAdded.has(id)) {
            idsAlreadyAdded.add(id);
            res.push(el);
          }
        }
        , arr
      );
      return res;
    }
  };
}
