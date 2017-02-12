'use strict';

//
// README
// - Ideally we'd prevent this node resolver from searching past the root
//   project directory.  However this fails in scenarios involving symlinks
//   (e.g. linked modules) and so I'm not sure there are any conditions we could
//   implement as safeguards without possibly causing issues elsewhere.  So for
//   now I'm foregoing any safeguards and leave it to the user to not screw up.
//   If this decision proves painful, then we can likely implement the
//   conditions based specifically on what users are tripping over.
//


//---------//
// Imports //
//---------//

const pify = require('pify');

const containedIn = require('../fxns/contained-in')
  , curry = require('lodash.curry')
  , discard = require('../fxns/discard')
  , findFirst = require('../fxns/find-first')
  , Module = require('../models/module')
  , mMap = require('../fxns/m-map')
  , mMapAccum = require('../fxns/m-map-accum')
  , path = require('path')
  , pFs = pify(require('fs'))
  , pipe = require('../fxns/pipe')
  , separate = require('../fxns/separate')
  ;

const { mPrepend } = require('../fxns/array')
  , { append, prepend, startsWith } = require('../fxns/string')
  , {
    alwaysReturn, getAtPath, getFirst, keys, pCatch, setAtPath
  } = require('../fxns/utils')

  , { pAll, pFalse } = require('../utils')
  ;


//------//
// Init //
//------//

const likelyAFilepathRe = /^\.*\//
  , parseJson = str => JSON.parse(str)
  , pathJoin = curry((a, b) => path.join(a, b))
  , targetToPjsonPreferredField = {
    browser: 'browser'
    , node: 'module'
  }
  ;


//------//
// Main //
//------//

const getResolver = ({ target = 'browser' } = {}) => {

  // we can cache attempted node resolves to forego duplicate attempts, it also
  //   prevents duplicate modules from being created
  const nodeResolveCache = {};

  return {
    name: 'node'

    , resolve({ requestString, dependentModuleId }) {
      if (
        !requestString
        || isLikelyAFilepath(requestString)
        || !startsWith('/', dependentModuleId)
      ) return pFalse;

      const dependentModuleDir = path.dirname(dependentModuleId)
        , cacheKey = [dependentModuleDir, requestString]
        , cachedVal = getAtPath(cacheKey, nodeResolveCache)
        ;

      if (cachedVal) return cachedVal;

      // otherwise we need to run the node resolve algorithm to find the file

      const res = nodeResolve(target, requestString, dependentModuleDir);

      setAtPath(cacheKey, res, nodeResolveCache);

      return res;
    }
  };
};


//-------------//
// Helper Fxns //
//-------------//

function isLikelyAFilepath(str) {
  return likelyAFilepathRe.test(str);
}

//
// `nodeResolve` implements a variation of the algorithm found here:
// https://nodejs.org/api/modules.html#loading_from_node_modules_Folders
//
// specifically it implements the 'LOAD_NODE_MODULES' section of that algorithm
//
// the differences being
//   - core modules are ignored because we may be looking for a package with the
//     same name as a core module
//   - full and relative file paths are handled via the 'node-fs' resolver
//   - we don't throw an error upon a failed resolution
//
function nodeResolve(target, requestString, dependentModuleDir) {
  const moduleName = separate('/', requestString)[0]
    , nodeModuleDirs = getNodeModuleDirs(dependentModuleDir)
    , resolveModule = getResolveModule(targetToPjsonPreferredField[target], moduleName)
    ;

  return resolveModule(nodeModuleDirs);
}

function getResolveModule(pjsonPreferredField, moduleName) {
  const pjsonFields = [pjsonPreferredField, 'main']
    , loadAsDirectoryFileHandlers = new Map([
      ['package.json', handlePackageJson]
      , ['index.js', loadAsFile]
      , ['index.json', loadAsFile]
    ])
    ;

  return resolveModule;

  function resolveModule(nodeModuleDirs) {
    if (!nodeModuleDirs.length) return pFalse;

    const aNodeModuleDir = nodeModuleDirs.pop();

    return pFs.stat(aNodeModuleDir)
      .then(stats => {
        return (stats.isDirectory())
          ? handleNodeModuleDir(aNodeModuleDir)
          : resolveModule(nodeModuleDirs);
      })
      .catch(() => resolveModule(nodeModuleDirs))
      ;
  }

  function handleNodeModuleDir(aNodeModuleDir) {
    const fpath = path.join(aNodeModuleDir, moduleName);
    return pFs.stat(fpath)
      .then(stats => {
        if (stats.isDirectory())
          return loadAsDirectory(fpath);
        else if (stats.isFile())
          return loadAsFile(fpath);
        else
          return pFalse;
      })
      .catch(() => attemptToLoadJsAndJson(fpath))
      ;
  }

  function attemptToLoadJsAndJson(initialFpath) {
    const readFileAttempts = mMap(
      pipe(
        [
          prepend(initialFpath)
          , readFile
          , pCatch(alwaysReturn(false))
        ]
      )
      , ['.js', '.json']
    );

    return Promise.all(readFileAttempts)
      .then(([jsCode, jsonCode]) => {
        if (jsCode)
          return new Module({ id: initialFpath + '.js', code: jsCode });
        else if (jsonCode)
          return new Module({ id: initialFpath + '.json', code: jsonCode });
        else
          // this will get caught up in resolveModule
          return Promise.reject('.js nor .json file found');
      });
  }

  function loadAsFile(fpath) {
    return readFile(fpath)
      .then(code => new Module({ id: fpath, code }))
      ;
  }

  function loadAsDirectory(fpath) {
    return pFs.readdir(fpath)
      .then(fnames => {
        const setOfFnames = new Set(fnames);
        return pipe(
          [
            keys
            , findFirst(containedIn(setOfFnames))
            , fname => loadAsDirectoryFileHandlers.get(fname)(path.join(fpath, fname))
          ]
          , loadAsDirectoryFileHandlers
        );

      })
      ;
  }

  function handlePackageJson(fpath) {
    const fdir = path.dirname(fpath);

    return readFile(fpath)
      .then(pipe([
        parseJson
        , getFirst(pjsonFields)
        , pathJoin(fdir)
        , pjsonFPath => [pjsonFPath, readFile(pjsonFPath)]
        , pAll
      ]))
      .then(([pjsonFPath, code]) => new Module({
        id: pjsonFPath, code
      }))
      ;
  }
}

// this implements the 'NODE_MODULES_PATHS' section from the above
//   documentation, just in a smarter way
function getNodeModuleDirs(dependentModuleDir) {
  return pipe(
    [
      separate('/')
      , mPrepend('/')
      , discard(new Set(['node_modules']))
      , mMapAccum(toParts, '')
      , mMap(append('node_modules'))
    ]
    , dependentModuleDir
  );
}

function toParts(accum, currentPart) {
  return path.join(accum, currentPart, '/');
}

function readFile(fpath) {
  return pFs.readFile(fpath, 'utf8');
}


//---------//
// Exports //
//---------//

module.exports = getResolver;
