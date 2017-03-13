//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('last', 1, getCollectionTypeToLast);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToLast() {
  const last = something => something[something.length - 1];
  return {
    Array: last
    , String: last
  };
}
