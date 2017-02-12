'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , type = require('./type')
  ;


//------//
// Init //
//------//

const isType = (aType, val) => type(val) === aType;


//------//
// Main //
//------//

const findFirstValueIn = getfindFirstValueIn();


//-------------//
// Helper Fxns //
//-------------//

function getfindFirstValueIn() {
  return curry(
    (setOfValuesToCheck, orderedSetToIterate) => {
      const errMsgs = [];
      if (!isType('Set', setOfValuesToCheck)) {
        errMsgs.push(
          + "\n  setOfValuesToCheck type: " + type(setOfValuesToCheck)
        );
      }
      if (!isType('Set', orderedSetToIterate)) {
        errMsgs.push(
          + "\n  orderedSetToIterate type: " + type(orderedSetToIterate)
        );
      }
      if (errMsgs.length) {
        throw new Error(
          "findFirstValueIn requires both arguments to be type() 'Set'"
          + errMsgs.join('')
        );
      }

      // no errs
      let found;

      for(let val of orderedSetToIterate) {
        if (setOfValuesToCheck.has(val)) {
          found = val;
          break;
        }
      }

      return found;
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  findFirstValueIn
};
