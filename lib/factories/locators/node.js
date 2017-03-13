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

const arrayOfKeys = require('../../fxns/array-of-keys')
  , containedIn = require('../../fxns/contained-in')
  , curry = require('lodash.curry')
  , discard = require('../../fxns/discard')
  , discardFirst = require('../../fxns/discard-first')
  , discardLast = require('../../fxns/discard-last')
  , discardWhen = require('../../fxns/discard-when')
  , each = require('../../fxns/each')
  , getFrom = require('../../fxns/get-from')
  , hasKey = require('../../fxns/has-key')
  , isType = require('../../fxns/is-type')
  , keepWhen = require('../../fxns/keep-when')
  , mMap = require('../../fxns/m-map')
  , mMapAccum = require('../../fxns/m-map-accum')
  , passThrough = require('../../fxns/pass-through')
  , path = require('path')
  , pFs = pify(require('fs'))
  , pipe = require('../../fxns/pipe')
  , reverse = require('../../fxns/reverse')
  , separate = require('../../fxns/separate')
  , type = require('../../fxns/type')
  ;

const { append, endsWith, prepend, startsWith } = require('../../fxns/string')
  , { jcomma, truncatedJstring } = require('../../generic-utils')
  , {
    findFirstElement, findFirstResult, frontmostResolvedPromise, mAppend
    , mModifyAt, mPrepend, pFindFirstResult
  } = require('../../fxns/array')
  , {
    alwaysReturn, getAtPath, getOr, isLaden, pAll, setAtPath
  } = require('../../fxns/utils')
  ;


//------//
// Init //
//------//

const likelyAFilepathRe = /^\.*\//
  , parseJson = str => JSON.parse(str)
  , pathJoin = curry((a, b) => path.join(a, b))
  , allowedKeys = new Set(['target'])
  , allowedTargetValues = new Set(['browser', 'node'])
  ;


//------//
// Main //
//------//

function createLocator(argObj) {
  validateCreateLocator(...arguments);

  const target = getOr('target', 'browser', argObj)
    , nodeResolveCache = {}
    , nodeResolve = createNodeResolve(target, nodeResolveCache)
    ;

  return {
    name: 'node'

    , locate({ dependentModuleId, requestString }) {
      if (
        !requestString
        || isLikelyAFilepath(requestString)
        || !startsWith('/', dependentModuleId)
      ) return false;

      const dependentModuleDir = path.dirname(dependentModuleId)
        , cachedVal = getAtPath(
          [dependentModuleDir, requestString]
          , nodeResolveCache
        )
        ;

      if (cachedVal !== undefined) {
        return cachedVal;
      }

      return nodeResolve(
        requestString
        , dependentModuleDir
      );
    }

    // exposed for tests.  I could extract the cache to a module that then gets
    //   mocked, but it is literally just an object which seems odd to expose
    //   as a module.
    , _nodeResolveCache: nodeResolveCache
  };
}


//-------------//
// Helper Fxns //
//-------------//

function validateCreateLocator(arg) {
  if (arguments.length > 1) {
    throw new Error(
      "node -> createLocator requires at most one argument"
      + "\n  number of args: " + arguments.length
      + "\n  args passed: " + truncatedJstring(arguments)
    );
  }

  if (arguments.length === 1) {
    if (!isType('Object', arg)) {
      throw new Error(
        "node -> createLocator must be passed an argument that passes"
        + " `isType('Object')`"
        + "\n  type passed: " + type(arg)
      );
    }

    const currentKeys = arrayOfKeys(arg)
      , invalidKeys = discard(allowedKeys, currentKeys)
      ;

    if (isLaden(invalidKeys)) {
      throw new Error(
        "node -> createLocator was passed an invalid argument"
        + "\n  allowed properties: " + jcomma(allowedKeys)
        + "\n  invalid properties passed: " + jcomma(invalidKeys)
      );
    }

    if (hasKey('target', arg) && !allowedTargetValues.has(arg.target)) {
      throw new Error(
        "node -> createLocator: target is invalid"
        + "\n  allowed values: " + jcomma(allowedTargetValues)
        + "\n  value passed: " + truncatedJstring(arg.target)
      );
    }
  }
}

function isLikelyAFilepath(str) {
  return likelyAFilepathRe.test(str);
}

//
// `nodeResolve` implements a variation of the algorithm found here:
// https://nodejs.org/api/modules.html#modules_all_together
//
// specifically it implements the 'LOAD_NODE_MODULES' section of that algorithm
//
// the differences being
//   - core modules are ignored because we may be looking for a package with the
//     same name as a core module
//   - full and relative file paths are handled via the 'server-fs' resolver
//   - we don't throw an error upon a failed resolution
//   - this decides whether the package.json 'module' field should be used based
//     on whether it was requested via 'import'
//
function createNodeResolve(target, nodeResolveCache) {
  const orderedPjsonFields = (target === 'browser')
    ? ['browser', 'module', 'main']
    : ['module', 'main'];

  return function nodeResolve(requestString, dependentModuleDir) {
    const nodeModuleDirs = getNodeModuleDirs(dependentModuleDir)
      , locateModule = createLocateModule(
        orderedPjsonFields
        , requestString
        , nodeResolveCache
        , dependentModuleDir
      )
      ;

    return Promise.resolve(nodeModuleDirs)
      .then(pFindFirstResult(locateModule))
      .then(result => {

        if (!result) result = { result: false };



        // if we have a cache hit, then just return it.  The only way a cache
        //   hit could be possible at this point is if locateModule propagated
        //   down to this directory when it found the cache hit.  When that
        //   happens, locateModule updates the cache for all the directories
        //   leading to this one.
        const cacheHit = getAtPath([aNodeModuleDir, requestString], nodeResolveCache);
        if (cacheHit !== undefined) return result;

        // otherwise we need to update the cache and return the result

        // if the result was falsey, then locate failed and we should update
        //   our cache so future requests don't unnecessarily traverse
        //   the filesystem.  Otherw
        const baseDir = (result)
          ? discardLast('/node_modules'.length, aNodeModuleDir)
          : '/';

        updateCache_locateFinished(
          dependentModuleDir, baseDir, requestString, nodeResolveCache, result
        );

        return result;
      });
  };
}

function createLocateModule(orderedPjsonFields, requestString, nodeResolveCache
  , dependentModuleDir) {

  const loadAsDirectoryFileHandlers = new Map([
      ['package.json', createHandlePackageJson(orderedPjsonFields)]
      , ['index.js', loadAsFile]
      , ['index.json', loadAsFile]
    ])
    , filesWithHandlerArr = arrayOfKeys(loadAsDirectoryFileHandlers)
    ;

  return function locateModule(aNodeModuleDir) {
    const baseDir = path.dirname(aNodeModuleDir)
      , cachedVal = getAtPath([baseDir, requestString], nodeResolveCache)
      ;

    if (cachedVal !== undefined) {
      updateCache_cachedValFound(
        dependentModuleDir, baseDir, requestString, nodeResolveCache, cachedVal
      );
      return cachedVal;
    }

    return Promise.all([pFs.readdir(aNodeModuleDir), aNodeModuleDir])
      .then(handleNodeModuleDir)
      .catch(alwaysReturn(false))
      
      // TODO: update cache prior to returning the result
      .then(idAndCode => idAndCode && { aNodeModuleDir, result: idAndCode })
      ;
  };

  function handleNodeModuleDir([fnames, aNodeModuleDir]) {
    const fpath = path.join(aNodeModuleDir, requestString)
      , orderedLoadAttempts = getOrderedLoadAttempts(fnames, fpath)
      ;

    return frontmostResolvedPromise(orderedLoadAttempts)
      .then(res => res || false)
      ;
  }

  function getOrderedLoadAttempts(fnames, fpath) {
    const toOrderedAttempts = createToOrderedAttempts(fpath);
    return passThrough(
      new Set(fnames)
      , [
        keepWhen(containedIn(new Set([
          requestString
          , requestString + '.js'
          , requestString + '.json'
        ])))
        , toOrderedAttempts
      ]
    );
  }

  function createToOrderedAttempts(fpath) {
    return possibleFnames => {
      if (!possibleFnames.size) return [];

      const orderedAttempts = [];
      if (possibleFnames.has(requestString + '.js')) {
        mAppend(loadAsFile(fpath + '.js'), orderedAttempts);
      }
      if (possibleFnames.has(requestString + '.json')) {
        mAppend(loadAsFile(fpath + '.json'), orderedAttempts);
      }
      if (possibleFnames.has(requestString)) {
        mPrepend(loadAsFile(fpath), orderedAttempts);
        mAppend(loadAsDirectory(fpath), orderedAttempts);
      }

      return orderedAttempts;
    };
  }

  function loadAsDirectory(fpath) {
    return pFs.readdir(fpath)
      .then(fnames => {
        return passThrough(
          filesWithHandlerArr
          , [
            findFirstElement(containedIn(new Set(fnames)))
            , fname => loadAsDirectoryFileHandlers.get(fname)(path.join(fpath, fname))
          ]
        );
      })
      ;
  }
}

function loadAsFile(fpath) {
  return readFile(fpath)
    .then(code => ({ id: fpath, code }))
    ;
}

function createHandlePackageJson(orderedPjsonFields) {
  return function handlePackageJson(fpath) {
    const fdir = path.dirname(fpath);

    return readFile(fpath)
      .then(pjsonContent => {
        const getFromPackageJson = getFrom(parseJson(pjsonContent));
        return passThrough(
          orderedPjsonFields
          , [
            findFirstResult(getFromPackageJson)
            , pathJoin(fdir)
            , pjsonFPath => [pjsonFPath, readFile(pjsonFPath)]
            , pAll
          ]
        );
      })
      .then(([pjsonFPath, code]) => ({
        code
        , id: pjsonFPath
      }))
      ;
  };
}

// this implements the 'NODE_MODULES_PATHS' section from the above
//   documentation, just in a smarter way
function getNodeModuleDirs(dependentModuleDir) {
  return passThrough(
    dependentModuleDir
    , [
      separate('/')
      , mPrepend('/')
      , mMapAccum(pipe([toParts, append('/')]), '')
      , discardWhen(endsWith('/node_modules'))
      , mMap(append('node_modules'))
      , reverse
    ]
  );
}

function toParts(accum, currentPart) {
  return path.join(accum, currentPart);
}

function readFile(fpath) {
  return pFs.readFile(fpath, 'utf8');
}

//
// mutates nodeResolveCache
//
// this function is called when a node module was successfully located at
//   `${baseDir}/node_modules`.  In this case, we want all directories from
//   dependentModuleDir down to baseDir to be added to the cache for
//   requestString so that future requests don't have to propagate the
//   file system
//
function updateCache_locateFinished() {
  updateCache({ includeBaseDir: true }, ...arguments);
}

//
// again, mutates nodeResolveCache
//
// this function is called when a node module was found via the cache as a
//   result of propagating down the filesystem.  This means baseDir already has
//   the cached value, so dependendModuleDir down to but not including baseDir
//   needs to be added to the cache
//
function updateCache_cachedValFound() {
  updateCache({ includeBaseDir: false }, ...arguments);
}

function updateCache({ includeBaseDir }, dependentModuleDir, baseDir
  , requestString, nodeResolveCache, locateResult) {

  const setBaseDir = (includeBaseDir || baseDir === dependentModuleDir)
    ? mPrepend(baseDir)
    : mModifyAt(prepend(`${baseDir}/`), 0);

  passThrough(
    dependentModuleDir
    , [
      discardFirst(baseDir.length)
      , separate('/')
      , setBaseDir
      , mMapAccum(toParts, '')
      , each(dirToAddToCache => setAtPath(
        [dirToAddToCache, requestString]
        , locateResult
        , nodeResolveCache
      ))
    ]
  );
}


//---------//
// Exports //
//---------//

module.exports = createLocator;
