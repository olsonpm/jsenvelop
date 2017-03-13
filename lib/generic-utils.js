//---------//
// Imports //
//---------//

const pify = require('pify');

const join = require('./fxns/join')
  , passThrough = require('./fxns/pass-through')
  , pFs = pify(require('fs'))
  , pipe = require('./fxns/pipe')
  , separate = require('./fxns/separate')
  , take = require('./fxns/take')
  ;

const { mAppend } = require('./fxns/array');


//------//
// Init //
//------//

const isLikelyARelativePathRe = /^\.+\//;


//------//
// Main //
//------//

const dirname = fname => path.dirname(fname)
  , isInt = getIsInt()
  , isLikelyARelativePath = str => isLikelyARelativePathRe.test(str)
  , jcomma = join(', ')
  , jstring = str => JSON.stringify(str, null, 2)
  , logErr = err => { console.error(err); }
  , pFalse = Promise.resolve(false)
  , readFile = fpath => pFs.readFile(fpath, 'utf8')
  , truncatedJstring = pipe([jstring, truncateMultilineString])
  ;


//-------------//
// Helper Fxns //
//-------------//

function getIsInt() {
  return value => {
    return !isNaN(value)
      && parseInt(Number(value)) == value
      && !isNaN(parseInt(value, 10))
      ;
  };
}

function truncateMultilineString(str) {
  return passThrough(
    str
    , [
      separate('\n')
      , take(9)
      , mAppend('  ...')
      , join('\n')
    ]
  );
}


//---------//
// Exports //
//---------//

module.exports = {
  dirname, isInt, isLikelyARelativePath, jcomma, jstring, logErr, pFalse
  , readFile, truncatedJstring, truncateMultilineString
};
