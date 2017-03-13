//---------//
// Imports //
//---------//

const each = require('./each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('mMerge', 2, getCollectionTypeToMMerge);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToMMerge() {
  return {
    Map: (target, src) => {
      for (let [key, val] of src) {
        target.set(key, val);
      }
      return target;
    }
    , Object: (target, src) => {
      each(
        key => { target[key] = src[key]; }
        , Object.keys(src)
      );
      return target;
    }
  };
}
