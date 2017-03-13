//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('join', 2, getCollectionTypeToJoin);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToJoin() {
  return {
    Array: (str, arr) => arr.join(str)
    , Set: (str, aSet) => {
      const iter = aSet.values();
      let res = iter.next().value;
      for (let val of iter) {
        res += str + val;
      }
      return res;
    }
  };
}
