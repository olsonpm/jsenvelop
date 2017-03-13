//
// README
// - This is starting as a very small hack that gives me full file path names
//   to file contents.  The only restriction currently is that file paths must
//   start with a path separator.  File contents can be anything.  I will
//   probably impose more constraints as I flesh out MemFs' purpose.  For now
//   it's probably best not to think of it as a file system ~.~
//


//---------//
// Imports //
//---------//

const all = require('../fxns/all')
  , any = require('../fxns/any')
  , arrayOfKeys = require('../fxns/array-of-keys')
  , discard = require('../fxns/discard')
  , discardLastWhile = require('../fxns/discard-last-while')
  , each = require('../fxns/each')
  , flatten = require('../fxns/flatten')
  , hasKey = require('../fxns/has-key')
  , head = require('../fxns/head')
  , initial = require('../fxns/initial')
  , isType = require('../fxns/is-type')
  , join = require('../fxns/join')
  , last = require('../fxns/last')
  , mMap = require('../fxns/m-map')
  , passThrough = require('../fxns/pass-through')
  , reduce = require('../fxns/reduce')
  , reduceFirst = require('../fxns/reduce-first')
  , separate = require('../fxns/separate')
  , shallowClone = require('../fxns/shallow-clone')
  , tail = require('../fxns/tail')
  ;

const { invokeWith, not, strictEquals } = require('../fxns/utils')
  , {
    append, endsWith, prepend, startsWith, trimEnd, trimStart
  } = require('../fxns/string')
  ;


//------//
// Init //
//------//

const _isMemFs = Symbol();


//------//
// Main //
//------//

const memFsService = {
  create
  , dirname
  , isMemFs
  , joinPaths
  , resolvePath
};


//-------------//
// Helper Fxns //
//-------------//

function isMemFs(obj) {
  return obj[_isMemFs];
}

function dirname(fpath) {
  validateAPath(fpath);
  fpath = (endsWith('/', fpath))
    ? initial(fpath)
    : fpath;

  return passThrough(
    fpath
    , [
      discardLastWhile(not(strictEquals('/')))
      , initial
    ]
  ) || '/';
}

function joinPaths(segments) {
  validateJoinPaths.apply(null, arguments);

  // no errors woo woo

  const joinPathsFnPipe = [
    mMap(separate('/'))
    , flatten
    , discard(['.'])
    , reduceFirst(joinTwoSegments)
    , resolvePath
  ];

  if (startsWith('/', head(segments))) {
    joinPathsFnPipe.push(prepend('/'));
  }
  if (endsWith('/', last(segments))) {
    joinPathsFnPipe.push(append('/'));
  }

  return passThrough(segments, joinPathsFnPipe);
}

function resolvePath(aPath) {
  validateResolvePath.apply(null, arguments);

  // ain't no errors awww yeaaaaaa

  const resolveFnPipe = [
    separate('/')
    , reduce(getTrimRelativeSegments(aPath), [])
    , join('/')
  ];

  if (startsWith('/', aPath)) {
    resolveFnPipe.push(prepend('/'));
  }
  if (endsWith('/', aPath)) {
    resolveFnPipe.push(append('/'));
  }

  return passThrough(aPath, resolveFnPipe);
}

function create(initialPathToContent = {}) {
  each(validateResolvedPath, arrayOfKeys(initialPathToContent));

  const pathToContent = shallowClone(initialPathToContent)
    , memFs = { addFile, getFile, hasFile, removeFile }
    ;

  memFs[_isMemFs] = true;

  return memFs;

  // scoped helper fxns

  function addFile(fpath, content) {
    validateResolvedPath(fpath);
    pathToContent[fpath] = content;
    return memFs;
  }

  function removeFile(fpath) {
    validateResolvedPath(fpath);
    delete pathToContent[fpath];
    return memFs;
  }

  function hasFile(fpath) {
    validateResolvedPath(fpath);
    return hasKey(fpath, pathToContent);
  }

  function getFile(fpath) {
    validateResolvedPath(fpath);
    return pathToContent[fpath];
  }
}

// returns a reducer function
function getTrimRelativeSegments(originalPath) {
  return (res, aSegment) => {
    // we are guarnateed the segment will either contain two dots indicating a
    //   relative directory change, or a directory/file name.  Remember as well
    //   that mem-fs doesn't truly have the concept of directories.
    if (aSegment !== '..') res.push(aSegment);
    else if (res.length) res.pop();
    else {
      throw new Error(
        "invalid path provided: the number of parent directory segments goes"
        + " beyond the initial segment\n  path given: " + originalPath
      );
    }
    return res;
  };
}

function validateJoinPaths(segments) {
  let errMsg;
  if (arguments.length !== 1) {
    errMsg = "joinPaths requires a single argument"
      + "\n  args given: " + JSON.stringify(arguments, null, 2);
  } else if (!isType('Array', segments)) {
    errMsg = "joinPaths's argument must pass isType('Array')"
      + "\n  arg passed: " + JSON.stringify(segments, null, 2);
  } else if (!segments.length) {
    errMsg = "joinPaths requires at least one segment";
  } else if (!all(isType('String'), segments)) {
    errMsg = "joinPaths requires arguments of strings"
      + "\n  arguments provided: " + segments.join(', ');
  }
  if (errMsg) throw new Error(errMsg);
}

function validateResolvePath(aPath) {
  if (arguments.length !== 1) {
    throw new Error(
      "must pass a single string argument"
      + "\n  args given: " + JSON.stringify(arguments, null, 2)
    );
  }

  validateAPath(aPath);
}

function validateAPath(aPath) {
  let errMsg;
  if (!isType('String', aPath)) {
    errMsg = "path must pass isType('String')"
      + "\n  path given: " + JSON.stringify(aPath, null, 2);
  } else if (hasMoreThanTwoDotsInAPathSegment(aPath)) {
    errMsg = "resolvePath requires the path to not have more than two dots in a segment"
      + "\n  path given: " + aPath;
  }

  if (errMsg) throw new Error(errMsg);
}

function validateAFullPath(aPath) {
  validateAPath(aPath);

  if (!startsWith('/', aPath)) {
    throw new Error(
      "path must be a full path (must start with '/')"
      + "\n  path given: " + aPath
    );
  }
}

function hasMoreThanTwoDotsInAPathSegment(aPath) {
  // we are guaranteed the path is a string that starts with a path separator
  return passThrough(
    aPath
    , [
      invokeWith('split', ['/'])
      , tail
      , any /*segment*/ (startsWith('...'))
    ]
  );
}

function joinTwoSegments(a, b) {
  a = trimEnd('/', a);
  b = trimStart('/', b);
  return a + '/' + b;
}

function isUnresolved(aPath) {
  // aPath is guaranteed to have passed 'validateAFullPath'
  return passThrough(
    aPath
    , [
      invokeWith('split', ['/'])
      , any(/* path segment */ strictEquals('..'))
    ]
  );
}

function validateResolvedPath(aPath) {
  validateAFullPath(aPath);
  if (isUnresolved(aPath)) {
    throw new Error(
      "aPath must be resolved, meaning there cannot be relative '..' in between"
      + "\n  path given: " + aPath
    );
  }
}


//---------//
// Exports //
//---------//

module.exports = memFsService;
