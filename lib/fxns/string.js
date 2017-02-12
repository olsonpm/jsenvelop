'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , dropRightWhile = require('./drop-right-while')
  , dropWhile = require('./drop-while')
  , pipe = require('./pipe')
  , type = require('./type')
  ;

const { strictEquals } = require('./utils');


//------//
// Main //
//------//

const allCharsEq = getAllCharsEq()
  , append = getAppend()
  , endsWith = getEndsWith()
  , prepend = getPrepend()
  , startsWith = getStartsWith()
  , trim = getTrim()
  , trimEnd = getTrimEnd()
  , trimStart = getTrimStart()
  ;

// aliases
const appendTo = prepend
  , prependTo = append
  ;


//-------------//
// Helper Fxns //
//-------------//

function getAllCharsEq() {
  return curry(
    (char, str) => {
      let stillTruthy = true
      , i = 0;

      while (stillTruthy && i < str.length) {
        stillTruthy = char === str[i];
        i += 1;
      }

      return stillTruthy;
    }
  );
}

function getAppend() {
  return curry(
    (toAppend, str) => str + toAppend
  );
}

function getEndsWith() {
  return curry(
    (mightEndWithThis, str) => {
      if (type(str) !== 'String' || mightEndWithThis.length > str.length) {
        return false;
      }

      if (mightEndWithThis.length === 0) {
        throw new Error(
        "endsWith requires a 'mightEndWithThis' string of length >= 1"
          + "\n  Note: I haven't decided on a semantically proper approach to this"
          + " scenario.  By throwing an error I'm hoping to have a use-case to"
          + " figure through."
        );
      }

      let stillMatches
        , i = 1;

      do {
        stillMatches = str[str.length - i] === mightEndWithThis[mightEndWithThis.length - i];
        i += 1;
      } while (stillMatches && i <= mightEndWithThis.length);

      return stillMatches;
    }
  );
}

function getPrepend() {
  return curry(
    (toPrepend, str) => toPrepend + str
  );
}

function getStartsWith() {
  return curry(
    (mightStartWithThis, str) => {
      if (type(str) !== 'String' || mightStartWithThis.length > str.length) {
        return false;
      }

      if (mightStartWithThis.length === 0) {
        throw new Error(
          "startsWith requires a 'mightStartWithThis' string of length >= 1"
          + "\n  Note: I haven't decided on a semantically proper approach to this"
          + " scenario.  By throwing an error I'm hoping to have a use-case to"
          + " figure through."
        );
      }

      let stillMatches
        , i = 0;

      do {
        stillMatches = str[i] === mightStartWithThis[i];
        i += 1;
      } while (stillMatches && i < mightStartWithThis.length);

      return stillMatches;
    }
  );
}

function getTrim() {
  return curry(
    (aChar, str) => {
      validateAChar(aChar, 'trim');
      return pipe([
        trimEnd(aChar)
        , trimStart(aChar)
      ], str);
    }
  );
}

function getTrimEnd() {
  return curry(
    (aChar, str) => {
      validateAChar(aChar, 'trimEnd');
      return dropRightWhile(strictEquals(aChar), str);
    }
  );
}

function getTrimStart() {
  return curry(
    (aChar, str) => {
      validateAChar(aChar, 'trimStart');
      return dropWhile(strictEquals(aChar), str);
    }
  );
}

function validateAChar(aChar, fnName) {
  if (type(aChar) !== 'String' || aChar.length !== 1) {
    throw new Error(fnName + " requires the first argument to be a single character"
      + "\n  value given: " + JSON.stringify(aChar, null, 2)
    );
  }
}

//---------//
// Exports //
//---------//

module.exports = {
  allCharsEq, append, appendTo, endsWith, prepend, prependTo, startsWith, trim
  , trimEnd, trimStart
};
