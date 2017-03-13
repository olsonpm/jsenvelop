//---------//
// Imports //
//---------//

const alwaysReturn = require('./always-return')
  , arrayOfKeys = require('./array-of-keys')
  , get = require('./get')
  , pipe = require('./pipe')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('size', 1, getCollectionTypeToSize);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToSize() {
  return {
    Object: pipe([arrayOfKeys, get('length')])
    , Map: get('size')
    , Array: get('length')
    , Set: get('size')
    , String: get('length')
    , Null: alwaysReturn(0)
    , Undefined: alwaysReturn(0)
  };
}
