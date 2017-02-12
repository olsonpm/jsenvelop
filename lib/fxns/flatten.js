'use strict';

//
// README
// - flattens a single level
//


//---------//
// Imports //
//---------//

const each = require('./each')
  , type = require('./type')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller(1, getCollectionTypeToFlatten);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToFlatten() {
  return {
    Array: arr => {
      const res = [];
      each(
        el => {
          if (type(el) !== 'Array') res.push(el);
          else each(nestedEl => res.push(nestedEl), el);
        }
        , arr
      );
      return res;
    }
  };
}
