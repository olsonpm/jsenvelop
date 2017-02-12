'use strict';


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToEach);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToEach() {
  return {
    Map: (fn, aMap) => aMap.forEach(fn) || aMap
    , Object: (fn, obj) => {
      arrEach(
        aKey => { fn(obj[aKey], aKey, obj); }
        , Object.keys(obj)
      );
      return obj;
    }
    , Array: arrEach
    , Set: (fn, aSet) => aSet.forEach(fn) || aSet
  };
}

function arrEach(fn, arr) {
  //
  // shouldn't use Array.prototype.forEach because of
  //   http://stackoverflow.com/a/18884620
  //
  for (let i = 0; i < arr.length; i+=1) {
    fn(arr[i], i, arr);
  }
  return arr;
}
