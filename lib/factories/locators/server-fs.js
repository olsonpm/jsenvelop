//---------//
// Imports //
//---------//

const pify = require('pify');

const arrayOfKeys = require('../../fxns/array-of-keys')
  , containedIn = require('../../fxns/contained-in')
  , discard = require('../../fxns/discard')
  , hasKey = require('../../fxns/has-key')
  , isType = require('../../fxns/is-type')
  , map = require('../../fxns/map')
  , passThrough = require('../../fxns/pass-through')
  , path = require('path')
  , pFs = pify(require('fs'))
  , type = require('../../fxns/type')
  ;

const { prepend, startsWith } = require('../../fxns/string')
  , { alwaysReturn, getOr, isLaden } = require('../../fxns/utils')
  , { findFirstElement, mPrepend } = require('../../fxns/array')
  , {
    isLikelyARelativePath, jcomma, pFalse, truncatedJstring
  } = require('../../generic-utils')
  ;


//------//
// Init //
//------//

const allowedKeys = new Set(['extensionsToCheckInOrder']);


//------//
// Main //
//------//

function createLocator(argObj) {
  validateCreateLocator(...arguments);

  const extensionsToCheckInOrder = getOr(
      'extensionsToCheckInOrder'
      , ['.js', '.json']
      , argObj
    )
    , fsResolveCache = {}
    ;

  return {
    name: 'server-fs'

    , locate({ requestString, dependentModuleId }) {
      let fpath;
      if (startsWith('/', requestString)) {
        fpath = requestString;
      } else if (isLikelyARelativePath(requestString)) {
        fpath = path.join(path.dirname(dependentModuleId), requestString);
      }

      if (!fpath) return pFalse;
      else if (fsResolveCache[fpath]) return fsResolveCache[fpath];

      const res = attemptToResolveFile(extensionsToCheckInOrder, fpath);
      fsResolveCache[fpath] = res;

      return res;
    }
  };
}


//-------------//
// Helper Fxns //
//-------------//

function validateCreateLocator(arg) {
  if (arguments.length > 1) {
    throw new Error(
      "server-fs -> createLocator requires at most one argument"
      + "\n  number of args: " + arguments.length
      + "\n  args passed: " + truncatedJstring(arguments)
    );
  }

  if (arguments.length === 1) {
    if (!isType('Object', arg)) {
      throw new Error(
        "server-fs -> createLocator must be passed an argument that passes"
        + " `isType('Object')`"
        + "\n  type passed: " + type(arg)
      );
    }

    const currentKeys = arrayOfKeys(arg)
      , invalidKeys = discard(allowedKeys, currentKeys)
      ;

    if (isLaden(invalidKeys)) {
      throw new Error(
        "server-fs -> createLocator was passed an invalid argument"
        + "\n  allowed properties: " + jcomma(allowedKeys)
        + "\n  invalid properties passed: " + jcomma(invalidKeys)
      );
    }

    if (
      hasKey('extensionsToCheckInOrder', arg)
      && !isType('Array', arg.extensionsToCheckInOrder)
    ) {
      const invalidProp = arg.extensionsToCheckInOrder;

      throw new Error(
        "server-fs -> createLocator: extensionsToCheckInOrder must pass"
        + " isType('Array')"
        + "\n  type: " + type(invalidProp)
        + "\n  passed extensionsToCheckInOrder: " + truncatedJstring(invalidProp)
      );
    }
  }
}

function attemptToResolveFile(extensionsToCheckInOrder, fpath) {
  const dir = path.dirname(fpath)
    , baseFName = path.basename(fpath)
    ;

  return pFs.readdir(dir)
    .then(fnames => passThrough(
      extensionsToCheckInOrder
      , [
        map(prepend(baseFName))
        , mPrepend(baseFName)
        , findFirstElement(containedIn(new Set(fnames)))
        , foundFname => {
          if (!foundFname) return false;

          const fpathWithExt = path.join(dir, foundFname);
          return Promise.all([fpathWithExt, readFile(fpathWithExt)]);
        }
      ]
    ))
    .then(res => {
      if (!res) return res;

      const [fpathWithExt, code] = res;

      return {
        code
        , id: fpathWithExt
      };
    })
    .catch(alwaysReturn(false))
    ;
}

function readFile(fname) {
  return pFs.readFile(fname, 'utf8');
}


//---------//
// Exports //
//---------//

module.exports = createLocator;
