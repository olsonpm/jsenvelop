//---------//
// Imports //
//---------//

const arrayOfKeys = require('./array-of-keys')
  , curry = require('lodash.curry')
  , join = require('./join')
  , jstring = require('./_jstring')
  , mSet = require('./m-set')
  , ph = require('./ph')
  , size = require('./size')
  , type = require('./type')
  ;


//------//
// Init //
//------//

const toToGetVars = getToToGetVars()
  , validTypes = new Set(['Array', 'Set'])
  , validTo = new Set(arrayOfKeys(toToGetVars))
  ;


//------//
// Main //
//------//

const zipTo = curry((to, keyCollection, valCollection) => {
  let errMsgs = [];

  if (!validTo.has(to)) {
    errMsgs.push(
      "Invalid 'to' was passed"
      + "\n  to: " + jstring(to)
      + "\n  allowed values: " + join(', ', validTo)
    );
  } else if (!validTypes.has(type(keyCollection))) {
    errMsgs.push(
      "keyCollection must be type() Array or Set"
      + "\n  type(keyCollection): " + type(keyCollection)
      + "\n  keyCollection: " + jstring(keyCollection)
    );
  } else if (!validTypes.has(type(valCollection))) {
    errMsgs.push(
      "valCollection must be type() Array or Set"
      + "\n  type(valCollection): " + type(valCollection)
      + "\n  valCollection: " + jstring(valCollection)
    );
  } else if (size(keyCollection) !== size(valCollection)) {
    errMsgs.push(
      "zip requires keyCollection and valCollection lengths to be the same"
      + "\n  size(keyCollection): " + size(keyCollection)
      + "\n  size(valCollection): " + size(valCollection)
      + "\n  keyCollection: " + jstring(keyCollection)
      + "\n  valCollection: " + jstring(valCollection)
    );
  }

  if (errMsgs.length) throw new Error(errMsgs.join('\n\n'));

  // woo woo no errors mang
  const { res, mAdd } = toToGetVars[to]()
    , valIter = getIter(valCollection)
    ;
  let val;

  for (let key of keyCollection) {
    val = valIter.next().value;
    mAdd(key, val);
  }

  return res;
});

function getToToGetVars() {
  return {
    Array: () => {
      const res = []
        , mAdd = (key, val) => res.push([key, val]);
      return { res, mAdd };
    }
    , Object: () => {
      const res = {}
        , mAdd = mSet(ph, ph, res);
      return { res, mAdd };
    }
    , Map: () => {
      const res = new Map()
        , mAdd = res.set.bind(res);
      return { res, mAdd };
    }
  };
}

function getIter(iterable) {
  return iterable[Symbol.iterator]();
}


//---------//
// Exports //
//---------//

module.exports = zipTo;
