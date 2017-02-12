'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , discard = require('../fxns/discard')
  , each = require('../fxns/each')
  , head = require('../fxns/head')
  , join = require('../fxns/join')
  , mMerge = require('../fxns/m-merge')
  , getNodeResolver = require('../resolvers/node')
  , omit = require('../fxns/omit')
  , pipe = require('../fxns/pipe')
  , tail = require('../fxns/tail')
  ;

const {
    alwaysReturn, ifFalse, invokeWith, isLaden, keys
  } = require('../fxns/utils')

  , { mAppendTo, mPrependTo } = require('../fxns/array')
  , { pFalse } = require('../utils')
  ;


//------//
// Init //
//------//

// the reference must be declared up here
const resolveService = {};

const setOfResolverKeys = new Set(['name', 'resolve'])
  , resolvers = [
    getNodeResolver()
  ]
  ;

const returnTheService = alwaysReturn(resolveService)
  , appendResolver = getAppendResolver()
  , pFindFirst = getPFindFirst()
  , prependResolver = getPrependResolver()
  ;


//------//
// Main //
//------//

mMerge(
  resolveService
  , {
    appendResolver
    , prependResolver
    , resolve
    , appendManyResolvers: pipe([
      each(appendResolver)
      , returnTheService
    ])
    , prependManyResolvers: pipe([
      each(prependResolver)
      , returnTheService
    ])
  }
);


//-------------//
// Helper Fxns //
//-------------//

function getAppendResolver() {
  return pipe([
    validateResolver
    , mAppendTo(resolvers)
    , returnTheService
  ]);
}

function getPrependResolver() {
  return pipe([
    validateResolver
    , mPrependTo(resolvers)
    , returnTheService
  ]);
}

function validateResolver(aResolver) {
  const currentResolverKeys = keys(aResolver)
    , missingKeys = discard(currentResolverKeys, setOfResolverKeys)
    ;

  if (isLaden(missingKeys)) {
    throw new Error("The following keys are required for a resolver"
      + "\n  missing keys: " + join(', ', missingKeys)
      + "\n  all keys passed: " + join(', ', currentResolverKeys)
    );
  }

  const invalidKeys = keys(omit(setOfResolverKeys, aResolver));
  if (isLaden(invalidKeys)) {
    throw new Error("The following keys are invalid for a resolver"
      + "\n  name of resolver: " + aResolver.name
      + "\n  invalid keys: " + join(', ', invalidKeys)
    );
  }

  return aResolver;
}

function resolve(obj) {
  return pFindFirst(
      invokeWith('resolve', [obj])
      , resolvers
    )
    .then(res => {
      if (!res) {
        const { requestString, dependentModuleId } = obj;
        res = Promise.reject(
          "Unable to resolve - no resolver found for the following dependency"
          + "\n  requestString: " + requestString
          + "\n  dependentModuleId: " + dependentModuleId
        );
      }

      return res;
    })
    ;
}

function getPFindFirst() {
  return curry(pFindFirst);

  function pFindFirst(pFn, coll) {
    if (!coll.length) return pFalse;

    return pFn(head(coll))
      .then(
        ifFalse(() => pFindFirst(pFn, tail(coll)))
      )
      ;
  }
}


//---------//
// Exports //
//---------//

module.exports = resolveService;
