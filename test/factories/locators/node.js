//---------//
// Imports //
//---------//

const arrayOfKeys = require('../../../lib/fxns/array-of-keys')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , createNodeLocator = require('../../../lib/factories/locators/node')
  , discardFirst = require('../../../lib/fxns/discard-first')
  , each = require('../../../lib/fxns/each')
  , mMapAccum = require('../../../lib/fxns/m-map-accum')
  , passThrough = require('../../../lib/fxns/pass-through')
  , path = require('path')
  , separate = require('../../../lib/fxns/separate')
  ;

const { isLocator } = require('./helpers')
  , { mPrepend } = require('../../../lib/fxns/array')
  ;


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();


//------//
// Main //
//------//

suite('node', () => {
  suite('create', () => {
    test('pass target', () => {
      isLocator(createNodeLocator({ target: 'node' }))
        .should.be.true;
    });

    test('no args', () => {
      isLocator(createNodeLocator())
        .should.be.true;
    });
  });

  suite('locate', () => {
    suite('simple', () => {
      const nmDir = path.join(__dirname, '../../resources/locators/node/simple/node_modules')
        , baseEntryId = path.join(__dirname, '../../resources/locators/node/simple/base-entry.js')
        , up1EntryId = path.join(__dirname, '../../resources/locators/node/simple/src/up1-entry.js')
        , requestedVia = 'require'
        , simpleTests = getSimpleTests()
        , state = {}
        ;

      suite('no propagation', () => {
        const testNm = createTestNm(baseEntryId, state, nmDir, requestedVia, true);

        setup(setLocateAndCache);
        each(testNm, simpleTests);
      });

      suite('propagate one directory', () => {
        const testNm = createTestNm(up1EntryId, state, nmDir, requestedVia, false);

        setup(setLocateAndCache);
        each(testNm, simpleTests);
      });

      function setLocateAndCache() {
        const nl = createNodeLocator();
        state.locate = nl.locate;
        state.cache = nl._nodeResolveCache;
      }

      function getSimpleTests() {
        return [
          ['no extension', 'dep1', 'dep1']
          , ['js extension', 'dep2', 'dep2.js']
          , ['json extension', 'dep3', 'dep3.json']
          , ['dir -> index.js', 'dep4', 'dep4/index.js']
          , ['dir -> index.json', 'dep5', 'dep5/index.json']
          , ['dir -> package.json -> browser', 'dep6', 'dep6/browser.js']
          , ['dir -> package.json -> main', 'dep7', 'dep7/main.js']
        ];
      }
    });

    suite('edge cases', () => {
      const nmDir = path.join(__dirname, '../../resources/locators/node/edge-cases/node_modules')
        , baseEntryId = path.join(__dirname, '../../resources/locators/node/edge-cases/base-entry.js')
        ;

      let locate;

      suite('file and directory load order', () => {
        setup(() => { locate = createNodeLocator().locate; });

        test('no file extension comes first', () => {
          return locate({
              requestString: 'dep1'
              , dependentModuleId: baseEntryId
              , requestedVia: 'require'
            })
            .should.become({
              id: nmDir + '/' + 'dep1'
              , code: 'dep1 content\n'
            });
        });

        test('.js next', () => {
          return locate({
              requestString: 'dep2'
              , dependentModuleId: baseEntryId
              , requestedVia: 'require'
            })
            .should.become({
              id: nmDir + '/' + 'dep2.js'
              , code: 'dep2.js content\n'
            });
        });

        test('then .json', () => {
          return locate({
              requestString: 'dep3'
              , dependentModuleId: baseEntryId
              , requestedVia: 'require'
            })
            .should.become({
              id: nmDir + '/' + 'dep3.json'
              , code: 'dep3.json content\n'
            });
        });
      });
    });

    suite('cache hits', () => {
      const nmDir = path.join(__dirname, '../../resources/locators/node/cache-hits/node_modules')
        , baseEntryId = path.join(__dirname, '../../resources/locators/node/cache-hits/base-entry.js')
        , up1EntryId = path.join(__dirname, '../../resources/locators/node/cache-hits/src/up1-entry.js')
        , up1AltEntryId = path.join(__dirname, '../../resources/locators/node/cache-hits/src/up1-alt-entry.js')
        , state = {}
        ;

      setup(setLocateAndCache);

      test('none', () => {
        const id = nmDir + '/' + 'dep/index.js'
          , code = 'dep content\n'
          , expectedModule = { code, id }
          ;

        return state.locate({
            requestString: 'dep'
            , dependentModuleId: baseEntryId
            , requestedVia: 'require'
          })
          .then(res => {
            res.should.deep.equal(expectedModule);

            const baseDir = path.dirname(baseEntryId);
            arrayOfKeys(state.cache).should.deep.equal([baseDir]);
            arrayOfKeys(state.cache[baseDir]).should.deep.equal(['dep']);

            state.cache[baseDir].dep.should.equal(res);
          });
      });

      test('some', () => {
        const id = nmDir + '/' + 'dep/index.js'
          , code = 'dep content\n'
          , expectedModule = { code, id }
          , baseDir = path.dirname(baseEntryId)
          , up1Dir = path.dirname(up1EntryId)
          ;

        // create the cache entry for baseDir
        return state.locate({
            requestString: 'dep'
            , dependentModuleId: baseEntryId
            , requestedVia: 'require'
          })

          // then for up1Dir
          .then(() => state.locate({
            requestString: 'dep'
            , dependentModuleId: up1EntryId
            , requestedVia: 'require'
          }))
          .then(res => {
            // now make sure the result deep equals what we expect it to
            res.should.deep.equal(expectedModule);

            // and that our cache has only entries for base and up1 directories
            arrayOfKeys(state.cache).should.deep.equal([baseDir, up1Dir]);
            arrayOfKeys(state.cache[baseDir]).should.deep.equal(['dep']);
            arrayOfKeys(state.cache[up1Dir]).should.deep.equal(['dep']);

            // and that each cache entry exactly equals the result of the
            //   previous locate call.  This proves a cache hit since otherwise
            //   a new object would have been created.
            state.cache[baseDir].dep.should.equal(res);
            state.cache[up1Dir].dep.should.equal(res);

            // with the above validations, we make one last locate call from
            //   an alternate dependent module but in the same directory..
            return state.locate({
              requestString: 'dep'
              , dependentModuleId: up1AltEntryId
              , requestedVia: 'require'
            });
          })
          .then(res => {
            res.should.deep.equal(expectedModule);

            // and finally re-run the cache validations from above to ensure
            //   the cache wasn't touched.
            arrayOfKeys(state.cache).should.deep.equal([baseDir, up1Dir]);
            arrayOfKeys(state.cache[baseDir]).should.deep.equal(['dep']);
            arrayOfKeys(state.cache[up1Dir]).should.deep.equal(['dep']);
            state.cache[baseDir].dep.should.equal(res);
            state.cache[up1Dir].dep.should.equal(res);
          });
      });

      test('all dirs fail', () => {
        return state.locate({
            requestString: "doesn't exist"
            , dependentModuleId: baseEntryId
            , requestedVia: 'require'
          })
          .then(res => {
            res.should.be.false;

            const baseDir = path.dirname(baseEntryId)
              , attemptedNodeDirs = getAttemptedNodeDirs('/', baseDir)
              ;

            arrayOfKeys(state.cache).should.deep.equal(attemptedNodeDirs);
            each(
              cacheDir => {
                arrayOfKeys(cacheDir).should.deep.equal(["doesn't exist"]);
                cacheDir["doesn't exist"].should.be.false;
              }
              , state.cache
            );
          });
      });

      function setLocateAndCache() {
        const nl = createNodeLocator();
        state.locate = nl.locate;
        state.cache = nl._nodeResolveCache;
      }
    });
  });
});


function createTestNm(dependentModuleId, state, nmDir, requestedVia, isBaseDir) {
  return function testNm([desc, requestString, fname]) {
    const code = `${requestString} content\n`
      , id = nmDir + '/' + fname
      , expectedModule = { code, id }
      ;

    test(desc, () => {
      return state.locate({
          requestString
          , dependentModuleId
          , requestedVia
        })
        .should.become(expectedModule)
        .then(() => {
          if (isBaseDir) {
            const baseDir = path.dirname(dependentModuleId);
            state.cache.should.deep.equal({
              [baseDir]: {
                [requestString]: expectedModule
              }
            });
          } else { // !isBaseDir (i.e. testing up1EntryId)
            const up1Dir = path.dirname(dependentModuleId)
              , baseDir = path.dirname(up1Dir)
              ;

            state.cache.should.deep.equal({
              [baseDir]: {
                [requestString]: expectedModule
              }
              , [up1Dir]: {
                [requestString]: expectedModule
              }
            });
          }
        })
        ;
    });
  };
}

function getAttemptedNodeDirs(from, to) {
  return passThrough(
    to
    , [
      discardFirst(from.length)
      , separate('/')
      , mPrepend(from)
      , mMapAccum(toParts, '')
    ]
  );
}
function toParts(accum, currentPart) {
  return path.join(accum, currentPart);
}
