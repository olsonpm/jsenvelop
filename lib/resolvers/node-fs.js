'use strict';


//---------//
// Imports //
//---------//

const pify = require('pify');

const map = require('../fxns/map')
  , Module = require('../models/module')
  , path = require('path')
  , pFs = pify(require('fs'))
  , pipe = require('../fxns/pipe')
  ;

const { appendTo, startsWith } = require('../fxns/string')
  , { isLikelyARelativePath, pFalse } = require('../utils')
  , { findFirstValueIn } = require('../fxns/set')
  , { alwaysReturn, constructN1 } = require('../fxns/utils')
  , { mPrepend } = require('../fxns/array')
  ;


//------//
// Main //
//------//

const getResolver = ({ extensionsToCheckInOrder = ['.js', '.json'] } = {}) => {
  // we can cache attempted readFiles to forego duplicate attempts, it also
  //   prevents duplicate modules from being created
  const fsResolveCache = {};

  return {
    name: 'node-fs'

    , resolve({ requestString, dependentModuleId }) {
      let fpath;
      if (startsWith('/', requestString)) {
        fpath = requestString;
      } else if (isLikelyARelativePath(requestString)) {
        fpath = path.join(path.dirname(dependentModuleId), requestString);
      }

      console.log('requestString: ' + requestString);
      console.log('fpath: ' + fpath);

      if (!fpath) return pFalse;
      else if (fsResolveCache[fpath]) return fsResolveCache[fpath];

      const res = attemptToResolveFile(extensionsToCheckInOrder, fpath);
      fsResolveCache[fpath] = res;

      return res;
    }
  };
};


//-------------//
// Helper Fxns //
//-------------//

function attemptToResolveFile(extensionsToCheckInOrder, fpath) {
  const dir = path.dirname(fpath)
    , baseFName = path.basename(fpath)
    ;

  return pFs.readdir(dir)
    .then(fnames => pipe(
      [
        map(appendTo(baseFName))
        , mPrepend(baseFName)
        , constructN1(Set)
        , findFirstValueIn(new Set(fnames))
        , foundFname => (foundFname)
          ? readFile(path.join(dir, foundFname))
          : pFalse
      ]
      , extensionsToCheckInOrder
    ))
    // need to check against false explicitly since 'code' may be an
    //   empty string
    .then(code => (code !== false) && new Module({ id: fpath, code }))
    .catch(alwaysReturn(false))
    ;
}

function readFile(fname) {
  return pFs.readFile(fname, 'utf8');
}


//---------//
// Exports //
//---------//

module.exports = getResolver;
