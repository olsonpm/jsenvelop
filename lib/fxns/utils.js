'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , filter = require('./filter')
  , findFirst = require('./find-first')
  , join = require('./join')
  , mMap = require('./m-map')
  , pipe = require('./pipe')
  , reduce = require('./reduce')
  , type = require('./type')
  , typeCaller = require('./type-caller')
  ;


//------//
// Init //
//------//

const assignableTypes = new Set(['object', 'function']);


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
  , adhereOwnEnumerable = obj => pipe(
    [
      Object.keys
      , filter(aKey => is(Function, obj[aKey]))
      , reduce(
        (res, aKey) => mSet(
          aKey
          , (...args) => obj[aKey](...args)
          , res
        )
        , {}
      )
    ]
    , obj
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
  , flip = getFlip()
  , get = createGet()
  , getEq = createGetEq()
  , getFirst = createGetFirst()
  , getFrom = flip(get)
  , getAtPath = createGetAtPath()
  , hasKey = createHasKey()
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
  , invokeWith = curry(
    (key, args, obj) => is(Function, get(key, obj))
      ? obj[key](...args)
      : undefined
  )
  , is = getIs()
  , isDefined = val => typeof val !== 'undefined'
  , isType = curry((aType, val) => type(val) === aType)
  , isUndefined = val => typeof val === 'undefined'
  , keys = typeCaller(1, getCollectionTypeToKeys)
  , mSet = curry((key, val, obj) => { obj[key] = val; return obj; })
  , noop = alwaysReturn(undefined)
  , not = curry((fn, ...args) => !fn(...args), 2)
  , pCatch = curry((fn, aPromise) => aPromise.catch.call(aPromise, fn))
  , ph = curry.placeholder
  , setAtPath = createSetAtPath()
  , size = typeCaller(1, getCollectionTypeToSize)
  , strictEquals = curry((val1, val2) => val1 === val2)
  , then = curry((fn, aPromise) => aPromise.then.call(aPromise, fn))
  , toBoolean = val => !!val
  , isLaden = pipe([size, toBoolean])
  , isEmpty = not(isLaden)
  , values = typeCaller(1, getCollectionTypeToValues)
  ;


//-------------//
// Helper Fxns //
//-------------//

function createGet() {
  return curry(
    (key, obj) => hasKey(key, obj)
      ? obj[key]
      : undefined
  );
}

function createGetEq() {
  return curry(
    (key, eqTo, obj) => hasKey(key, obj)
      ? obj[key] === eqTo
      : undefined
  );
}

function createGetFirst() {
  return curry(
    (keyArr, obj) => pipe(
      [
        findFirst(hasKey(ph, obj))
        , getFrom(obj)
      ]
      , keyArr
    )
  );
}

//
// The implementation of this method is kind of weird due to there being no
//   uniform way to determine whether a key 'exists' on a variable.  The below
//   implementation consciously lacks checks for properties on non-object types
//   which are explicitly (and confusingly) set to undefined.  This use-case
//   should either be narrow enough not to ever worry about, or non-existent.
//
function createHasKey() {
  return curry(
    (key, obj) => {
      if (obj === undefined || obj === null) return false;

      return isDefined(obj[key])
        || (
          typeof obj === 'object'
          && key in obj
        );
    }
  );
}

function getCollectionTypeToKeys() {
  return {
    Object: obj => new Set(Object.keys(obj))
    , Map: aMap => new Set(aMap.keys())
  };
}

function getCollectionTypeToValues() {
  return {
    Object: obj => mMap(
      aKey => obj[aKey]
      , Object.keys(obj)
    )
    , Map: aMap => mMap(
      aKey => aMap.get(aKey)
      , [...aMap.keys()]
    )
  };
}

function getCollectionTypeToSize() {
  return {
    Object: pipe([keys, get('size')])
    , Map: get('size')
    , Array: get('length')
    , Set: get('size')
    , String: get('length')
    , Null: alwaysReturn(0)
    , Undefined: alwaysReturn(0)
  };
}

function getIs() {
  return curry(
    (Ctor, val) => (
      getEq('constructor', Ctor, val)
      || val instanceof Ctor
    )
  );
}

function getFlip() {
  return fn => curry((a, b) => fn(b, a));
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
  , constructN1, eachOffset, flip, get, getAtPath, getEq, getFirst, getFrom
  , hasKey, hasPath, ifFalse, ifThenTransform, invoke, invokeWith, is, isDefined
  , isEmpty, isLaden, isType, isUndefined, keys, mSet, noop, not, pCatch, ph
  , setAtPath, size, strictEquals, then, toBoolean, values
};
