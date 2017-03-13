//---------//
// Imports //
//---------//

const arrayOfKeys = require('../fxns/array-of-keys')
  , createResolver = require('./resolver')
  , deepEql = require('deep-eql')
  , discard = require('../fxns/discard')
  , discardWhen = require('../fxns/discard-when')
  , each = require('../fxns/each')
  , hasKey = require('../fxns/has-key')
  , isType = require('../fxns/is-type')
  , map = require('../fxns/map')
  , passThrough = require('../fxns/pass-through')
  , recursivelyParseModule = require('../recursively-parse-module')
  , sModule = require('../services/module')
  , toWrittenList = require('../fxns/to-written-list')
  , type = require('../fxns/type')
  ;

const { parseCodeToAst } = require('../domain-utils')
  , { jcomma, logErr, readFile, truncatedJstring } = require('../generic-utils')
  , { startsWith, wrap } = require('../fxns/string')
  , { isLaden } = require('../fxns/utils')
  ;


//------//
// Init //
//------//

const createJsenvelopAllowedKeys = new Set(['locators'])
  , createJsenvelopRequiredKeys = createJsenvelopAllowedKeys
  , jsenvelopAllowedKeys = new Set(['entry'])
  , jsenvelopRequiredKeys = jsenvelopAllowedKeys
  , requiredLocatorKeys = new Set(['name', 'locate'])
  ;


//------//
// Main //
//------//

function createJsenvelop(argObj) {
  validateCreateJsenvelop(...arguments);

  const resolver = createResolver({ locators: argObj.locators });

  return function jsenvelop(innerArgObj) {
    validateJsenvelop(...arguments);

    const { entry } = innerArgObj;

    // first set up the entry module
    return readFile(entry)
      .catch(err => {
        if (err.code === 'ENOTFOUND') {
          throw new Error(
            "entry module not found on disk"
            + "\n  entry: " + entry
            + "\n  error: " + err
          );
        } else {
          throw new Error(
            "error when trying to read entry"
            + "\n  entry: " + entry
            + "\n  error: " + err
          );
        }
      })
      .then(code => {
        const entryModule = sModule.createModule({
          code
          , ast: parseCodeToAst(code)
          , id: entry
        });

        //
        // now recursively resolve and add new modules (i.e. generate the
        //   dependency tree)
        //
        return Promise.all([
          entryModule
          , recursivelyParseModule(entryModule, resolver)
        ]);
      })
      .then(([entryModule, moduleContainer]) => {

      })
      .catch(err => {
        if (err.errors) {
          const errors = err.errors;
          delete err.errors;
          logErr(err);
          logErr('errors: ');
          each(logErr, errors);
        } else {
          logErr(err);
        }
      })
      ;
  };
}


//-------------//
// Helper Fxns //
//-------------//

function validateCreateJsenvelop(arg) {
  if (arguments.length !== 1) {
    throw new Error(
      "createJsenvelop requires exactly one argument"
      + "\n  number of args: " + arguments.length
      + "\n  args passed: " + truncatedJstring(arguments)
    );
  }
  if (!isType('Object', arg)) {
    throw new Error(
      "createJsenvelop must be passed an argument that passes"
      + " `isType('Object')`"
      + "\n  type passed: " + type(arg)
    );
  }

  const currentKeys = arrayOfKeys(arg)
    , invalidKeys = discard(createJsenvelopAllowedKeys, currentKeys)
    ;

  if (isLaden(invalidKeys)) {
    throw new Error(
      "createJsenvelop was passed an invalid argument"
      + "\n  allowed keys: " + jcomma(createJsenvelopAllowedKeys)
      + "\n  invalid keys passed: " + jcomma(invalidKeys)
    );
  }

  const missingKeys = discard(createJsenvelopRequiredKeys, currentKeys);
  if (isLaden(missingKeys)) {
    throw new Error(
      "createJsenvelop was passed an invalid argument"
      + "\n  required keys: " + jcomma(createJsenvelopRequiredKeys)
      + "\n  missing keys: " + jcomma(missingKeys)
    );
  }

  if (hasKey('locators', arg)) {
    if (!isType('Array', arg.locators)) {
      throw new Error(
        "createJsenvelop: locators must pass isType('Array')"
        + "\n  locators type: " + type(arg.locators)
        + "\n  locators: " + truncatedJstring(arg.locators)
      );
    }

    const invalidLocators = discardWhen(isLocator, arg.locators);
    if (isLaden(invalidLocators)) {
      const desc = passThrough(requiredLocatorKeys, [map(wrap("'")), toWrittenList]);
      throw new Error(
        "createJsenvelop: invalid locators passed.  A locator must have only"
        + " the keys " + desc
        + "\n  invalid locators: " + truncatedJstring(invalidLocators)
      );
    }
  }
}

function isLocator(aLocator) {
  const locatorKeys = new Set(arrayOfKeys(aLocator));
  return deepEql(locatorKeys, requiredLocatorKeys);
}

function validateJsenvelop(arg) {
  if (arguments.length !== 1) {
    throw new Error(
      "jsenvelop requires exactly one argument"
      + "\n  number of args: " + arguments.length
      + "\n  args passed: " + truncatedJstring(arguments)
    );
  }
  if (!isType('Object', arg)) {
    throw new Error(
      "jsenvelop must be passed an argument that passes"
      + " `isType('Object')`"
      + "\n  type passed: " + type(arg)
    );
  }

  const currentKeys = arrayOfKeys(arg)
    , invalidKeys = discard(jsenvelopAllowedKeys, currentKeys)
    ;

  if (isLaden(invalidKeys)) {
    throw new Error(
      "jsenvelop was passed an invalid argument"
      + "\n  allowed keys: " + jcomma(jsenvelopAllowedKeys)
      + "\n  invalid keys passed: " + jcomma(invalidKeys)
    );
  }

  const missingKeys = discard(jsenvelopRequiredKeys, currentKeys);
  if (isLaden(missingKeys)) {
    throw new Error(
      "jsenvelop was passed an invalid argument"
      + "\n  required keys: " + jcomma(jsenvelopRequiredKeys)
      + "\n  missing keys: " + jcomma(missingKeys)
    );
  }

  if (hasKey('entry', arg)) {
    if (!isType('String', arg.entry)) {
      throw new Error(
        "jsenvelop: entry must pass isType('String')"
        + "\n  entry type: " + type(arg.entry)
        + "\n  entry: " + truncatedJstring(arg.entry)
      );
    }
    if (!startsWith('/', arg.entry)) {
      throw new Error(
        "entry must be a full path to a file on disk"
        + "\n  entry passed: " + arg.entry
      );
    }
  }
}


//---------//
// Exports //
//---------//

module.exports = createJsenvelop;
