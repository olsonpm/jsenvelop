//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , discardFirstWhile = require('./discard-first-while')
  , discardLastWhile = require('./discard-last-while')
  , passThrough = require('./pass-through')
  , type = require('./type')
  ;

const { strictEquals } = require('./utils');


//------//
// Main //
//------//

const allCharsEq = getAllCharsEq()
  , append = getAppend()
  , capFirst = str => str[0].toUpperCase() + str.slice(1)
  , endsWith = getEndsWith()
  , isMatch = curry((aRegex, str) => aRegex.test(str))
  , prepend = getPrepend()
  , repeat = getRepeat()
  , startsWith = getStartsWith()
  , trimChar = getTrim('char')
  , trimEndChar = getTrimEnd('char')
  , trimStartChar = getTrimStart('char')
  , trimWhile = getTrim('predicate')
  , trimEndWhile = getTrimEnd('predicate')
  , trimStartWhile = getTrimStart('predicate')
  , wrap = curry((str, something) => str + something + str)
  ;

// aliases
const appendTo = prepend
  , prependTo = append
  ;


//-------------//
// Helper Fxns //
//-------------//

function getRepeat() {
  return curry(
    (count, pattern) => {
      if (count < 1) return '';
      var result = '';
      while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
      }
      return result + pattern;
    }
  );
}

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

function getTrim(type) {
  const _trimEnd = getTrimEnd(type)
    , _trimStart = getTrimStart(type)
    ;
  return curry(
    (charOrPredicate, str) => {
      return passThrough(str, [
        _trimEnd(charOrPredicate)
        , _trimStart(charOrPredicate)
      ]);
    }
  );
}

function getTrimEnd(type) {
  return (type === 'char')
    ? (aChar, str) => discardLastWhile(strictEquals(aChar), str)
    : (predicate, str) => discardLastWhile(predicate, str);
}

function getTrimStart(type) {
  return (type === 'char')
    ? (aChar, str) => discardFirstWhile(strictEquals(aChar), str)
    : (predicate, str) => discardFirstWhile(predicate, str);
}


//---------//
// Exports //
//---------//

module.exports = {
  allCharsEq, append, appendTo, capFirst, endsWith, isMatch, prepend, prependTo
  , repeat, startsWith, trimChar, trimEndChar, trimStartChar, trimWhile
  , trimEndWhile, trimStartWhile, wrap
};
