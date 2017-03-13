//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');

const { isInt } = require('../generic-utils');


//------//
// Main //
//------//

module.exports = typeCaller('hasElementAt', 2, getCollectionTypeToHasElementAt);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToHasElementAt() {
  return {
    Map: (key, aMap) => aMap.has(key)
    , Array: (idx, arr) => {
      if (isInt(idx)) {
        return typeof arr[idx] !== 'undefined'
          || idx in arr;
      } else {
        throw new Error(
          "hasElementAt for an array requires idx to parse as an integer"
          + "\n  idx: " + JSON.stringify(idx, null, 2)
        );
      }
    }
  };
}
