//---------//
// Imports //
//---------//

const arrayOfKeys = require('./array-of-keys')
  , arrayOfValues = require('./array-of-values')
  , curry = require('lodash.curry')
  , flip = require('./flip')
  , get = require('./get')
  , keepWhen = require('./keep-when')
  , hasKey = require('./has-key')
  , initial = require('./initial')
  , join = require('./join')
  , last = require('./last')
  , map = require('./map')
  , mMap = require('./m-map')
  , mSet = require('./m-set')
  , mUnset = require('./m-unset')
  , passThrough = require('./pass-through')
  , ph = require('./ph')
  , pipe = require('./pipe')
  , reduce = require('./reduce')
  , reduceFresh = require('./reduce-fresh')
  , size = require('./size')
  , toPairs = require('./to-pairs')
  , zipTo = require('./zip-to')
  ;


//------//
// Init //
//------//

const assignableTypes = new Set(['object', 'function'])
  , then = curry((fn, aPromise) => aPromise.then.call(aPromise, fn))
  , mUnsetFrom = flip(mUnset)
  ;


//------//
// Main //
//------//

const adhere = curry(
    (key, obj) => (...args) => obj[key](...args)
  )
  , adhereEach = curry(
    (keyArr, obj) => reduce(
      (res, aKey) => mSet(
        aKey
        , (...args) => obj[aKey](...args)
        , res
      )
      , {}
      , keyArr
    )
  )
  , adhereOwnEnumerable = obj => passThrough(
    obj
    , [
      Object.keys
      , keepWhen(aKey => is(Function, obj[aKey]))
      , reduce(
        (res, aKey) => mSet(
          aKey
          , (...args) => obj[aKey](...args)
          , res
        )
        , {}
      )
    ]
  )
  , alwaysReturn = something => () => something
  , apply = curry(
    (args, fn) => fn(...args)
  )
  , construct = curry(
    (ctor, argArr) => new ctor(...argArr)
  )
  , constructN1 = curry(
    (ctor, arg) => new ctor(arg)
  )
  , eachOffset = curry(
    (fn, arr, idxOffset) => {
      for (let i = idxOffset; i < arr.length; i+=1) {
        fn(arr[i], i, arr);
      }
      return arr;
    }
  )
  , fromPairs = reduceFresh(
    (res, [key, val]) => mSet(key, val, res)
    , () => ({})
  )
  , getAtPath = createGetAtPath()
  , getEq = createGetEq()
  , getOr = createGetOr()
  , hasPath = getHasPath()
  , ifThenTransform = curry(
    (predicate, transform, val) => (predicate(val))
      ? transform(val)
      : val
  )
  , ifFalse = curry((fn, val) => (!val) ? fn() : val)
  , invoke = curry(
    (key, obj) => is(Function, get(key, obj))
      ? obj[key]()
      : undefined
  )
  , invokeAtPath = curry(
    (path, obj) => passThrough(
      obj
      , [
        getAtPath(initial(path))
        , invoke(last(path))
      ]
    )
  )
  , invokeAtPathWith = curry(
    (path, args, obj) => passThrough(
      obj
      , [
        getAtPath(initial(path))
        , invokeWith(last(path), args)
      ]
    )
  )
  , invokeWith = curry(
    (key, args, obj) => is(Function, get(key, obj))
      ? obj[key](...args)
      : undefined
  )
  , is = getIs()
  , isDefined = val => val !== undefined
  , isUndefined = val => val === undefined
  , noop = alwaysReturn(undefined)
  , not = curry((fn, ...args) => !fn(...args), 2)
  , pAll = arr => Promise.all(arr)
  , pAllSettled = getPAllSettled()
  , pCatch = curry((fn, aPromise) => aPromise.catch.call(aPromise, fn))
  , pProps = getPProps()
  , pPropsSettled = getPPropsSettled()
  , pReject = err => Promise.reject(err)
  , pResolve = val => Promise.resolve(val)
  , run = fn => fn()
  , setAtPath = createSetAtPath()
  , strictEquals = curry((val1, val2) => val1 === val2)
  , toBoolean = val => !!val
  , isLaden = pipe([size, toBoolean])
  , isEmpty = not(isLaden)
  ;


//-------------//
// Helper Fxns //
//-------------//

function createGetEq() {
  return curry(
    (key, eqTo, obj) => hasKey(key, obj)
      ? obj[key] === eqTo
      : undefined
  );
}

function createGetOr() {
  return curry(
    (key, fallback, obj) => (hasKey(key, obj))
      ? obj[key]
      : fallback
  );
}

function getIs() {
  return curry(
    (Ctor, val) => (
      getEq('constructor', Ctor, val)
      || val instanceof Ctor
    )
  );
}

function getHasPath() {
  return curry(
    (path, obj) => {
      // not sure what the desired case would be for an empty path, so throwing
      //   an error until I encounter it
      if (!path.length) {
        throw new Error("hasPath requires a laden path"
          + "path: " + JSON.stringify(path, null, 2)
        );
      }

      let i = 0
        , keyMatches = true;

      while (keyMatches && i < path.length) {
        keyMatches = hasKey(path[i], obj);
        if (keyMatches) obj = obj[path[i]];
        i += 1;
      }

      return !!(keyMatches && i === path.length);
    }
  );
}

//
// implementation is purposefully near copy/paste from hasPath.  The reason
//   they don't share code is because one returns a value and the other a
//   boolean, where the boolean is not necessarily derived from the value
//
function createGetAtPath() {
  return curry(
    (path, obj) => {
      // not sure what the desired case would be for an empty path, so throwing
      //   an error until I encounter it
      if (!path.length) {
        throw new Error("getAtPath requires a laden path"
          + "path: " + JSON.stringify(path, null, 2)
        );
      }

      let i = 0
        , keyMatches = true;

      while (keyMatches && i < path.length) {
        keyMatches = hasKey(path[i], obj);
        if (keyMatches) obj = obj[path[i]];
        i += 1;
      }

      return (keyMatches && i === path.length)
        ? obj
        : undefined;
    }
  );
}

function pReflect(aPromise) {
  return aPromise.then(
    successVal => ({ value: successVal, status: 'resolved' })
    , err => ({ value: err, status: 'rejected' })
  );
}

function getPAllSettled() {
  return pipe([map(pReflect), pAll]);
}

function getPProps() {
  return pipe([ // takes an object
    toPairs
    , mMap(pAll)
    , pAll
    , then(fromPairs)
  ]);
}

function getPPropsSettled() {
  return obj => passThrough(
    obj
    , [
      arrayOfValues
      , pAllSettled
      , then(zipTo('Object', arrayOfKeys(obj)))
    ]
  );
}

function createSetAtPath() {
  return curry(
    (path, val, obj) => {
      // not sure what the desired case would be for an empty path, so throwing
      //   an error until I encounter it
      if (!path.length) {
        throw new Error("setAtPath requires a laden path"
          + "path: " + JSON.stringify(path, null, 2)
        );
      }

      let i = 0
        , keyMatches = true
        , shouldCheckForKey = true
        , tmpObj = obj
        ;

      while (keyMatches && i < path.length) {
        if (!shouldCheckForKey) {
          if (i < path.length - 1) {
            tmpObj = tmpObj[path[i]] = {};
          } else if (i === path.length - 1) {
            tmpObj[path[i]] = val;
          }
        } else {
          if (!hasKey(path[i], tmpObj)) {
            if (i < path.length - 1) {
              tmpObj = tmpObj[path[i]] = {};
              shouldCheckForKey = false;
            } else if (i === path.length - 1) {
              tmpObj[path[i]] = val;
            }
          } else {
            if (!assignableTypes.has(typeof tmpObj[path[i]])) {
              throw new Error(
                "setAtPath was given a path containing an unassignable key"
                + "\n  path: " + join(', ', path)
                + "\n  unassignable key: " + JSON.stringify(path[i], null, 2)
                + "\n  value at key: " + JSON.stringify(tmpObj[path[i]], null, 2)
                + "\n  typeof value at key: " + (typeof tmpObj[path[i]])
                + "\n  assignable types: " + join(', ', assignableTypes)
              );
            }

            tmpObj = tmpObj[path[i]];
          }
        }

        i += 1;
      }

      return obj;
    }
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  adhere, adhereEach, adhereOwnEnumerable, alwaysReturn, apply, construct
  , constructN1, eachOffset, fromPairs, getAtPath, getEq, getOr, hasPath
  , ifFalse, ifThenTransform, invoke, invokeAtPath, invokeAtPathWith, invokeWith
  , is, isDefined, isEmpty, isLaden, isUndefined, mSet, mUnsetFrom, noop, not
  , pAll, pAllSettled, pCatch, ph, pProps, pPropsSettled, pReflect, pReject
  , pResolve, run, setAtPath, strictEquals, then, toBoolean
};
