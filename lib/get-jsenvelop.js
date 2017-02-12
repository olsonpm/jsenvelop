'use strict';


//---------//
// Imports //
//---------//

const pify = require('pify');

const babylon = require('babylon')
  , pFs = pify(require('fs'))
  , recursivelyParseModules = require('./recursively-parse-modules')
  ;

const { addModule } = require('./services/module')
  , { appendResolver } = require('./services/resolve')
  , { parseCodeToAst } = require('./services/utils')
  , { startsWith } = require('./fxns/string')
  ;


//------//
// Main //
//------//

const getJsenvelop = fsResolver => {
  appendResolver(fsResolver);
  return jsenvelop;

  // scoped helper functions

  function jsenvelop(entry) {
    if (!startsWith('/', entry)) {
      throw new Error("entry must be a full path to a file on disk"
        + "\n  entry: " + JSON.stringify(entry, null, 2)
      );
    }
    // first set up the entry module
    return pFs.readFile(entry, 'utf8')
      .catch(err => {
        if (err.code === 'ENOTFOUND') {
          throw new Error("entry module not found on disk"
            + "\n  entry: " + entry
            + "\n  error: " + err
          );
        } else {
          throw new Error("error when trying to read entry"
            + "\n  entry: " + entry
            + "\n  error: " + err
          );
        }
      })
      .then(code => {
        const entryModule = {
          id: entry
          , code
        };

        entryModule.ast = parseCodeToAst(entryModule.code);
        addModule(entryModule);

        //
        // now recursively resolve and add new modules (i.e. generate the
        //   dependency tree)
        //
        return generateDependencyTree(entryModule);
      })
      ;
  }
};


//---------//
// Exports //
//---------//

module.exports = getJsenvelop;
