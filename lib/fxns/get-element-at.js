'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');

const { isInt } = require('../utils');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToGetElementAt);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToGetElementAt() {
  return {
    Map: (key, aMap) => aMap.get(key)
    , Array: (idx, arr) => {
      if (isInt(idx)) {
        return arr[idx];
      } else {
        throw new Error(
          "getElementAt for an array requires idx to parse as an integer"
          + "\n  idx: " + JSON.stringify(idx, null, 2)
        );
      }
    }
  };
}
