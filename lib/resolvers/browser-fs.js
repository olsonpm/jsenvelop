'use strict';

//
// README
// - For now all resolvers will return promises of their results.  I can't think
//   of a helpful configurable design that allows otherwise.  It shouldn't be
//   too hard to change in the future should that design change.
//


//---------//
// Imports //
//---------//

const MemFs = require('../models/mem-fs')
  , Module = require('../models/module')
  ;

const { startsWith } = require('../fxns/string')
  , { is } = require('../fxns/utils')
  , { isLikelyARelativePath, pFalse } = require('../utils')
  ;


//------//
// Main //
//------//

const getResolver = ({ memFsInst } = {}) => {
  if (!is(MemFs, memFsInst)) {
    throw new Error(
      "browser-fs `getResolver` requires memFsInst to pass is(MemFs)"
      + "\n  memFsInst given: " + JSON.stringify(memFsInst, null, 2)
    );
  }

  // prevents duplicate modules from being created
  const memFsResolveCache = {};

  return {
    name: 'browser-fs'

    , resolve({ requestString, dependentModuleId }) {
      const dependentModuleDir = MemFs.dirname(dependentModuleId);

      let fpath;

      if (startsWith('/', requestString)) {
        fpath = requestString;
      } else if (isLikelyARelativePath(requestString)) {
        fpath = MemFs.joinPaths([dependentModuleDir, requestString]);
      }

      // we should only attempt to resolve the request string if it resembles
      //   a file path
      if (!fpath) return pFalse;

      const code = memFsInst.getFile(fpath);

      if (!code) return pFalse;

      if (!memFsResolveCache[fpath]) {
        memFsResolveCache[fpath] = Promise.resolve(
          new Module({ id: fpath , code })
        );
      }

      return memFsResolveCache[fpath];
    }
  };
};



//---------//
// Exports //
//---------//

module.exports = getResolver;
