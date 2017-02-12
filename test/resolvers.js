'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , getBrowserFs = require('../lib/resolvers/browser-fs')
  , getNodeResolver = require('../lib/resolvers/node')
  , getNodeFs = require('../lib/resolvers/node-fs')
  , map = require('../lib/fxns/map')
  , MemFs = require('../lib/models/mem-fs')
  , Module = require('../lib/models/module')
  , path = require('path')
  , pipe = require('../lib/fxns/pipe')
  ;

const { values } = require('../lib/fxns/utils')
  ;


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();


//------//
// Main //
//------//

suite('resolvers', () => {
  suite('browser-fs', () => {
    const memFsInst = new MemFs()
      , entryModule = new Module({ id: '/entry.js', code: 'some code' })
      , browserFs = getBrowserFs({ memFsInst })
      , dependentModuleId = entryModule.id
      ;

    memFsInst.addFile('/a/root/dependency.js', 'root path content');
    memFsInst.addFile('/a/relative/dependency.js', 'relative path content');

    test('get new resolver', () => {
      browserFs.name.should.equal('browser-fs');
    });

    test('resolve', () => {
      return Promise.all([
        browserFs.resolve({ requestString: 'not/relative/nor/root', dependentModuleId })
          .should.eventually.be.false

        , browserFs.resolve({ requestString: '', dependentModuleId })
          .should.eventually.be.false

        , browserFs.resolve({ requestString: '/does/not/exist', dependentModuleId })
          .should.eventually.be.false

        , browserFs.resolve({ requestString: '/a/root/dependency.js', dependentModuleId })
          .should.become(
            {
              id: '/a/root/dependency.js'
              , code: 'root path content'
              , dependsOn: []
            }
          )

        , browserFs.resolve({ requestString: './a/relative/dependency.js', dependentModuleId })
          .should.become(
            {
              id: '/a/relative/dependency.js'
              , code: 'relative path content'
              , dependsOn: []
            }
          )
      ]);
    });
  });

  suite('node-fs', () => {
    const nodeFs = getNodeFs()
      , entryModuleFullPath = path.join(__dirname, 'resources/resolvers/node-fs/entry.js')
      , entryModule = new Module({ id: entryModuleFullPath, code: 'some code' })
      , fullPathToDep = path.join(__dirname, 'resources/resolvers/node-fs/a-dependency.js')
      , relativePathToDep = './a-dependency.js'
      , relativePathToDepExtMissing = './a-dependency'
      , dependentModuleId = entryModule.id
      ;

    test('get new resolver', () => {
      nodeFs.name.should.equal('node-fs');
    });

    test('resolve', () => {
      return Promise.all([
        nodeFs.resolve({ requestString: 'not/relative/nor/root', dependentModuleId })
          .should.eventually.be.false

        , nodeFs.resolve({ requestString: '', dependentModuleId })
          .should.eventually.be.false

        , nodeFs.resolve({ requestString: './does/not/exist', dependentModuleId })
          .should.eventually.be.false

        , nodeFs.resolve({ requestString: fullPathToDep, dependentModuleId })
          .should.become(
            {
              id: fullPathToDep
              , code: 'the code\n'
              , dependsOn: []
            }
          )

        , nodeFs.resolve({ requestString: relativePathToDep, dependentModuleId })
          .should.become(
            {
              id: path.join(path.dirname(fullPathToDep), relativePathToDep)
              , code: 'the code\n'
              , dependsOn: []
            }
          )

        , nodeFs.resolve({ requestString: relativePathToDepExtMissing, dependentModuleId })
          .should.become(
            {
              id: path.join(path.dirname(fullPathToDep), relativePathToDep)
              , code: 'the code\n'
              , dependsOn: []
            }
          )
      ]);
    });
  });

  suite('node', () => {
    const nodeResolver = getNodeResolver()
      , entryModuleFullPath = path.join(__dirname, 'resources/resolvers/node/entry.js')
      , entryModule = new Module({ id: entryModuleFullPath, code: 'some code' })
      , dependentModuleId = entryModule.id
      , nonexistentDep = "_____hopefully_this_module_name_doesnt_exist"
      , depPaths = {
        dep1: path.join(__dirname, 'resources/resolvers/node/node_modules/dep1')
        , dep2: path.join(__dirname, 'resources/resolvers/node/node_modules/dep2.js')
        , dep3: path.join(__dirname, 'resources/resolvers/node/node_modules/dep3.json')
        , dep4: path.join(__dirname, 'resources/resolvers/node/node_modules/dep4/main.js')
        , dep5: path.join(__dirname, 'resources/resolvers/node/node_modules/dep5/index.js')
        , dep6: path.join(__dirname, 'resources/resolvers/node/node_modules/dep6/index.json')
      }
      , depResolveTests = getDepResolveTests(depPaths)
      ;

    test('get new resolver', () => {
      nodeResolver.name.should.equal('node');
    });

    test('resolve', () => {
      const dep1 = nodeResolver.resolve({ requestString: 'dep1', dependentModuleId })
        , dep1Again = nodeResolver.resolve({ requestString: 'dep1', dependentModuleId })
        ;

      dep1.should.equal(dep1Again);

      return Promise.all(
        [
          nodeResolver.resolve({ requestString: '', dependentModuleId })
            .should.eventually.be.false

          , nodeResolver.resolve({ requestString: './file/paths/wont/be/resolved', dependentModuleId })
            .should.eventually.be.false

          , nodeResolver.resolve({ requestString: nonexistentDep, dependentModuleId })
            .should.eventually.be.false
        ].concat(depResolveTests)
      );
    });

    // helper fxns

    function getDepResolveTests() {
      return pipe(
        [
          map(createDepTest)
          , values
        ]
        , depPaths
      );
    }

    // this is a mapper function
    function createDepTest(depPath, depName) {
      return nodeResolver.resolve({ requestString: depName, dependentModuleId })
        .should.become(
          {
            id: depPath
            , code: `${depName} content\n`
            , dependsOn: []
          }
        );
    }
  });
});
