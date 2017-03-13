//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('contains', 2, getCollectionTypeToContains);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToContains() {
  const stringAndArrayContains = (val, str) => str.indexOf(val) !== -1;
  return {
    String: stringAndArrayContains
    , Object: (val, obj) => {
      const keys = Object.keys(obj);

      let found = false
        , i = 0;

      while (!found && i < keys.length) {
        found = val === obj[keys[i]];
        i += 1;
      }

      return found;
    }
    , Map: (val, aMap) => {
      let found = false;
      for (let [,mapVal] of aMap) {
        found = val === mapVal;
        if (found) break;
      }
      return found;
    }
    , Array: stringAndArrayContains
    , Set: (val, aSet) => aSet.has(val)
  };
}
