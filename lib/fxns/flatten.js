//
// README
// - flattens a single level
//


//---------//
// Imports //
//---------//

const arrEach = require('./_arr-each')
  , type = require('./type')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('flatten', 1, getCollectionTypeToFlatten);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToFlatten() {
  return {
    Array: arr => {
      const res = [];
      arrEach(
        el => {
          if (type(el) !== 'Array') res.push(el);
          else arrEach(nestedEl => res.push(nestedEl), el);
        }
        , arr
      );
      return res;
    }
  };
}
