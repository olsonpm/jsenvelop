//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller('tail', 1, getCollectionTypeToTail);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToTail() {
  const tail = something => something.slice(1);
  
  return {
    Array: tail
    , String: tail
  };
}
