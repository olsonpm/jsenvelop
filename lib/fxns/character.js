'use strict';


//------//
// Main //
//------//

const hasNoCase = getHasNoCase()
  , isLowercase = getIsLowercase()
  , isUppercase = getIsUppercase()
  ;


//-------------//
// Helper Fxns //
//-------------//

function getIsUppercase() {
  return char => char.toUpperCase() === char
    && char.toLowerCase() !== char;
}

function getIsLowercase() {
  return char => char.toLowerCase() === char
    && char.toUpperCase() !== char;
}

function getHasNoCase() {
  return char => char.toLowerCase() === char
    && char.toUpperCase() === char;
}


//---------//
// Exports //
//---------//

module.exports = {
  hasNoCase, isLowercase, isUppercase
};
