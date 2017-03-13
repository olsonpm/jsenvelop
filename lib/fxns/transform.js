//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , hasKey = require('./has-key')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('transform', 2, getCollectionTypeToTransform);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToTransform() {
  return {
    Map: (transformerMap, aMap) => {
      const res = new Map();
      for (let [key, val] of aMap) {
        res.set(
          key
          , (transformerMap.has(key))
            ? transformerMap.get(key)(val)
            : val
        );
      }
      return res;
    }
    , Object: (transformerObj, obj) => {
      const res = {};

      arrEach(
        aKey => {
          const val = obj[aKey];
          res[aKey] = (hasKey(aKey, transformerObj))
            ? transformerObj[aKey](val)
            : val;
        }
        , Object.keys(obj)
      );

      return res;
    }
    , Array: (transformerArr, arr) => {
      const res = [];
      for (let i = 0; i < arr.length; i+=1) {
        const val = arr[i];
        res.push(
          (transformerArr[i])
            ? transformerArr[i](val)
            : val
        );
      }
      return res;
    }
  };
}
