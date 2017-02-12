'use strict';


//---------//
// Imports //
//---------//

const pify = require('pify');

const babylon = require('babylon')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , curry = require('lodash.curry')
  , mMap = require('../lib/fxns/m-map')
  , mMerge = require('../lib/fxns/m-merge')
  , Module = require('../lib/models/module')
  , path = require('path')
  , pFs = pify(require('fs'))
  , pipe = require('../lib/fxns/pipe')
  , recursivelyParseModules = require('../lib/recursively-parse-modules')
  ;

const { pAll } = require('../lib/utils')
  , { getModules } = require('../lib/services/module')
  ;


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();

const mMapThrough = curry(
  (fnArr, coll) => mMap(pipe(fnArr), coll)
);

const expect = chai.expect
  , getRequestStringsFromAst = recursivelyParseModules._getRequestStringsFromAst
  ;


//------//
// Main //
//------//

suite('recursivelyParseModules', () => {
  test('the exported method', () => {
    const fname = '/home/phil/git-repos/personal/jsenvelop/playground/index.js';
    return readFile(fname)
      .then(code => recursivelyParseModules(new Module({
        id: fname
        , code: code
      })))
      .then(() => {

      })
      .catch(errs => {
        console.error('errs: ' + errs);
      })
      ;
  });

  suite('private methods', () => {

    suite('getRequestStringsFromAst', () => {
      const code = {};

      setup(getRequestStringsFromAstSetup(code));

      test('happy path', () => {
        getRequestStringsFromAst(
          parse(code.happyPath)
        ).should.deep.equal(['dep1', 'dep2', 'dep3']);
      });

      test('invalid require - number of arguments', () => {
        expect(() => {
          getRequestStringsFromAst(
            parse(code.numArgs)
          );
        }).to.throw(
          "unexpected `require()` call - a single argument must be passed"
        );
      });

      test('invalid require - single string', () => {
        expect(() => {
          getRequestStringsFromAst(
            parse(code.singleString)
          );
        }).to.throw(
          "jsenvelop currently only supports require statements with a single"
          + " string literal"
        );
      });
    });

  });
});


//-------------//
// Helper Fxns //
//-------------//

function parse(code) {
  return babylon.parse(code, { sourceType: 'module' });
}

function readFile(fname) {
  return pFs.readFile(fname, 'utf8');
}

function pathJoin(a) {
  return b => path.join(a, b);
}

function getRequestStringsFromAstSetup(code) {
  return () => {
    const dir = path.join(__dirname, 'resources/recursively-parse-modules/get-request-strings-from-ast');
    return pFs.readdir(dir)
      .then(pipe([
        mMapThrough([
          pathJoin(dir)
          , readFile
        ])
        , pAll
      ]))
      .then(([happyPath, numArgs, singleString]) => {
        mMerge(code, {
          happyPath
          , numArgs
          , singleString
        });
      });
  };
}
