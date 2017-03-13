//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('initial', 1, getCollectionTypeToInitial);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToInitial() {
  const initial = something => something.slice(0, -1);
  return {
    Array: initial
    , String: initial
  };
}
