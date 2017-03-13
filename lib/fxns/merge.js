//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , shallowClone = require('./shallow-clone')
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
      const res = new Map(target);
      for (let [key, val] of src) {
        res.set(key, val);
      }
      return res;
    }
    , Object: (target, src) => {
      const res = shallowClone(target);
      arrEach(
        key => { res[key] = src[key]; }
        , Object.keys(src)
      );
      return res;
    }
  };
}
