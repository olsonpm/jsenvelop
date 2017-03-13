//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('head', 1, getCollectionTypeToHead);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToHead() {
  const head = something => something[0];
  return {
    Array: head
    , String: head
  };
}
