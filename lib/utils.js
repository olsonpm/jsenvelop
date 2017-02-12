'use strict';


//------//
// Init //
//------//

const isLikelyARelativePathRe = /^\.+\//;


//------//
// Main //
//------//

const isInt = getIsInt()
  , isLikelyARelativePath = str => isLikelyARelativePathRe.test(str)
  , jstring = str => JSON.stringify(str, null, 2)
  , pFalse = Promise.resolve(false)
  , pAll = something => Promise.all(something)
  ;


//-------------//
// Helper Fxns //
//-------------//

function getIsInt() {
  return value => {
    return !isNaN(value)
      && parseInt(Number(value)) == value
      && !isNaN(parseInt(value, 10))
      ;
  };
}


//---------//
// Exports //
//---------//

module.exports = { isInt, isLikelyARelativePath, jstring, pAll, pFalse };
