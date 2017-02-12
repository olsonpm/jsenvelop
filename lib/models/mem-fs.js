'use strict';

//
// README
// - This is starting as a very small hack that gives me full file path names
//   to file contents.  The only restriction currently is that file paths must
//   start with a path separator.  File contents can be anything.  I will
//   probably impose more constraints as I flesh out the purpose MemFs serves.
//   For now it's probably best not to think of it as a file system -.-
//


//---------//
// Imports //
//---------//

const all = require('../fxns/all')
  , any = require('../fxns/any')
  , discard = require('../fxns/discard')
  , dropRightWhile = require('../fxns/drop-right-while')
  , each = require('../fxns/each')
  , flatten = require('../fxns/flatten')
  , head = require('../fxns/head')
  , initial = require('../fxns/initial')
  , join = require('../fxns/join')
  , last = require('../fxns/last')
  , mMap = require('../fxns/m-map')
  , pipe = require('../fxns/pipe')
  , reduce = require('../fxns/reduce')
  , reduceFirst = require('../fxns/reduce-first')
  , separate = require('../fxns/separate')
  , tail = require('../fxns/tail')
  ;

const {
    append, endsWith, prepend, startsWith, trimEnd, trimStart
  } = require('../fxns/string')

  , {
    invokeWith, isType, keys, not, strictEquals
  } = require('../fxns/utils')
  ;


//------//
// Main //
//------//

class MemFs {
  constructor(initialFs = {}) {
    each(validateResolvedPath, keys(initialFs));
    this._fs = initialFs;
  }

  addFile(filePath, content) {
    validateResolvedPath(filePath);
    this._fs[filePath] = content;
    return this;
  }

  removeFile(filePath) {
    validateResolvedPath(filePath);
    delete this._fs[filePath];
    return this;
  }

  getFile(filePath) {
    validateResolvedPath(filePath);
    return this._fs[filePath];
  }

  static dirname(filePath) {
    validateAPath(filePath);
    filePath = (endsWith('/', filePath))
      ? initial(filePath)
      : filePath;

    return pipe(
      [
        dropRightWhile(not(strictEquals('/')))
        , initial
      ]
      , filePath
    ) || '/';
  }

  static joinPaths(segments) {
    validateJoinPaths.apply(null, arguments);

    // no errors woo woo

    const joinPathsFnPipe = [
      mMap(separate('/'))
      , flatten
      , discard(new Set(['.']))
      , reduceFirst(joinTwoSegments)
      , MemFs.resolvePath
    ];

    if (startsWith('/', head(segments))) {
      joinPathsFnPipe.push(prepend('/'));
    }
    if (endsWith('/', last(segments))) {
      joinPathsFnPipe.push(append('/'));
    }

    return pipe(joinPathsFnPipe, segments);
  }

  static resolvePath(aPath) {
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

    return pipe(resolveFnPipe, aPath);
  }
}


//-------------//
// Helper Fxns //
//-------------//

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
  return pipe(
    [
      invokeWith('split', ['/'])
      , tail
      , any /*segment*/ (startsWith('...'))
    ]
    , aPath
  );
}

function joinTwoSegments(a, b) {
  a = trimEnd('/', a);
  b = trimStart('/', b);
  return a + '/' + b;
}

function isUnresolved(aPath) {
  // aPath is guaranteed to have passed 'validateAFullPath'
  return pipe(
    [
      invokeWith('split', ['/'])
      , any /*segment*/ (strictEquals('..'))
    ]
    , aPath
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

module.exports = MemFs;
