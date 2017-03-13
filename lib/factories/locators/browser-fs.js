//
// README
// - For now all resolvers will return promises of their results.  I can't think
//   of a helpful configurable design that allows otherwise.  It shouldn't be
//   too hard to change in the future should that design change.
//


//---------//
// Imports //
//---------//

const arrayOfKeys = require('../../fxns/array-of-keys')
  , discard = require('../../fxns/discard')
  , hasKey = require('../../fxns/has-key')
  , isType = require('../../fxns/is-type')
  , map = require('../../fxns/map')
  , passThrough = require('../../fxns/pass-through')
  , sMemFs = require('../../services/mem-fs')
  , type = require('../../fxns/type')
  ;

const { prepend, startsWith } = require('../../fxns/string')
  , { findFirstElement, mPrepend } = require('../../fxns/array')
  , { getOr, isLaden } = require('../../fxns/utils')
  , {
    isLikelyARelativePath, jcomma, truncatedJstring
  } = require('../../generic-utils')
  ;


//------//
// Init //
//------//

const allowedKeys = new Set(['memFsInst', 'extensionsToCheckInOrder'])
  , { isMemFs } = sMemFs
  ;


//------//
// Main //
//------//

function createLocator(argObj) {
  validateCreateLocator(...arguments);

  const memFsInst = getOr('memFsInst', sMemFs.create(), argObj)
    , extensionsToCheckInOrder = passThrough(
      argObj
      , [
        getOr('extensionsToCheckInOrder', ['.js', '.json'])
        , mPrepend('')
      ]
    )
    ;

  return {
    name: 'browser-fs'

    , locate({ requestString, dependentModuleId }) {
      const dependentModuleDir = sMemFs.dirname(dependentModuleId);

      let fpath;

      if (startsWith('/', requestString)) {
        fpath = requestString;
      } else if (isLikelyARelativePath(requestString)) {
        fpath = sMemFs.joinPaths([dependentModuleDir, requestString]);
      }

      // we should only attempt to resolve the request string if it resembles
      //   a file path
      if (!fpath) return false;

      fpath = passThrough(
        extensionsToCheckInOrder
        , [
          map(prepend(fpath))
          , findFirstElement(memFsInst.hasFile)
        ]
      );

      if (!fpath) return false;

      return {
        id: fpath
        , code: memFsInst.getFile(fpath)
      };
    }
  };
}


//-------------//
// Helper Fxns //
//-------------//

function validateCreateLocator(arg) {
  if (arguments.length > 1) {
    throw new Error(
      "browser-fs -> createLocator requires at most one argument"
      + "\n  number of args: " + arguments.length
      + "\n  args passed: " + truncatedJstring(arguments)
    );
  }

  if (arguments.length === 1) {
    if (!isType('Object', arg)) {
      throw new Error(
        "browser-fs -> createLocator must be passed an argument that passes"
        + " `isType('Object')`"
        + "\n  type passed: " + type(arg)
      );
    }

    const currentKeys = arrayOfKeys(arg)
      , invalidKeys = discard(allowedKeys, currentKeys)
      ;

    if (isLaden(invalidKeys)) {
      throw new Error(
        "browser-fs -> createLocator was passed an invalid argument"
        + "\n  allowed properties: " + jcomma(allowedKeys)
        + "\n  invalid properties passed: " + jcomma(invalidKeys)
      );
    }

    if (hasKey('memFsInst', arg) && !isMemFs(arg.memFsInst)) {
      throw new Error(
        "browser-fs -> createLocator: memFsInst must pass isMemFs"
        + "\n  memFsInst given: " + truncatedJstring(arg.memFsInst)
      );
    }
  }
}


//---------//
// Exports //
//---------//

module.exports = createLocator;
