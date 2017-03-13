//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('reverse', 1, getCollectionTypeToReverse);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToReverse() {
  return {
    Array: arr => {
      const res = [];
      arrEach(
        el => res.unshift(el)
        , arr
      );
      return res;
    }
    , String: str => str.split('').reverse().join('')
  };
}
