//---------//
// Imports //
//---------//

const arrayOfKeys = require('../fxns/array-of-keys')
  , discard = require('../fxns/discard')
  , discardWhen = require('../fxns/discard-when')
  , each = require('../fxns/each')
  , hasKey = require('../fxns/has-key')
  , isType = require('../fxns/is-type')
  , join = require('../fxns/join')
  , passThrough = require('../fxns/pass-through')
  , reduce = require('../fxns/reduce')
  , type = require('../fxns/type')
  ;

const { getOr, invokeWith, isLaden } = require('../fxns/utils')
  , { mAppend, mPrepend, pFindFirstResult } = require('../fxns/array')
  , { startsWith } = require('../fxns/string')
  , { jcomma, jstring, truncateMultilineString } = require('../generic-utils')
  ;


//------//
// Init //
//------//

const allowedLocatorKeys = new Set(['name', 'locate'])
  , requiredLocatorKeys = allowedLocatorKeys
  , allowedCreateResolverKeys = new Set(['locators'])
  ;


//------//
// Main //
//------//

function createResolver(argObj) {
  validateCreateResolver(...arguments);

  const locators = getOr('locators', [], argObj)
    , resolver = getResolver()
    ;

  return resolver;

  // scoped helper fxns

  function getResolver() {
    return {
      resolve
      , setLocators
      , getLocators: () => locators
      , appendLocator
      , prependLocator
      , appendManyLocators
      , prependManyLocators
    };
  }

  function setLocators(locators_) {
    locators.length = 0;
    each(appendLocator, locators_);
    return resolver;
  }

  function appendManyLocators(locatorCollection) {
    each(appendLocator, locatorCollection);
    return resolver;
  }

  function prependManyLocators(locatorCollection) {
    each(prependLocator, locatorCollection);
    return resolver;
  }

  function appendLocator(aLocator) {
    validateLocator(aLocator);
    mAppend(aLocator, locators);
    return resolver;
  }

  function prependLocator(aLocator) {
    validateLocator(aLocator);
    mPrepend(aLocator, locators);
    return resolver;
  }

  function resolve(locateArg) {
    return Promise.resolve(locators)
      .then(
        pFindFirstResult(invokeWith('locate', [locateArg]))
      )
      .then(res => {
        if (!res) {
          const locateArgStr = passThrough(
            locateArg
            , [
              reduce(toLines, [])
              , join('\n')
            ]
          );

          return Promise.reject(
            "Unable to resolve - no locator found the following dependency"
            + locateArgStr
          );
        }

        return res;
      })
      ;
  }
}


//-------------//
// Helper Fxns //
//-------------//

function toLines(lineArr, val, key) {
  return mAppend(`  ${key}: ${jstring(val)}`, lineArr);
}

function validateCreateResolver(arg) {
  if (arguments.length > 1) {
    throw new Error(
      "createResolver must be called with at most one argument"
      + "\n  number of args: " + arguments.length
      + "\n  arguments: " + passThrough(
        arguments
        , [truncateMultilineString, jstring]
      )
    );
  }

  if (arguments.length === 1) {
    if (!isType('Object', arg)) {
      throw new Error(
        "createResolver must be passed an argument that passes `isType('Object')`"
        + "\n  type passed: " + type(arg)
        + "\n  arg passed: " + truncateMultilineString(jstring(arg))
      );
    }

    const currentResolverKeys = arrayOfKeys(arg)
      , invalidKeys = discard(allowedCreateResolverKeys, currentResolverKeys)
      ;

    if (isLaden(invalidKeys)) {
      throw new Error(
        "createResolver was passed an invalid argument"
        + "\n  allowed properties: " + jcomma(allowedCreateResolverKeys)
        + "\n  invalid properties passed: " + jcomma(invalidKeys)
      );
    }

    if (hasKey('locators', arg)) {
      if (!isType('Array', arg.locators)) {
        throw new Error(
          "createResolver: locators must pass isType('array')"
          + "\n  locators type: " + type(arg.locators)
          + "\n  locators: " + truncateMultilineString(jstring(arg.locators))
        );
      }
      each(validateLocator, arg.locators);
    }
  }
}

function validateLocator(aLocator) {
  const currentLocatorKeys = arrayOfKeys(aLocator)
    , missingKeys = discard(currentLocatorKeys, requiredLocatorKeys)
    ;

  if (isLaden(missingKeys)) {
    throw new Error("The following keys are required for a locator"
      + "\n  missing keys: " + jcomma(missingKeys)
      + "\n  all keys passed: " + jcomma(currentLocatorKeys)
    );
  }

  const invalidKeys = passThrough(
    currentLocatorKeys
    , [
      discard(allowedLocatorKeys)
      , discardWhen(startsWith('_'))
    ]
  );
  if (isLaden(invalidKeys)) {
    throw new Error("The following keys are invalid for a locator"
      + "\n  name of locator: " + aLocator.name
      + "\n  invalid keys: " + jcomma(invalidKeys)
    );
  }

  return aLocator;
}


//---------//
// Exports //
//---------//

module.exports = createResolver;
