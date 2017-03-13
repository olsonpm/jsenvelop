//---------//
// Imports //
//---------//

const chai = require('chai')
  , createBrowserFsLocator = require('../../../lib/factories/locators/browser-fs')
  , sMemFs = require('../../../lib/services/mem-fs')
  ;

const { isLocator } = require('./helpers');


//------//
// Init //
//------//

chai.should();


//------//
// Main //
//------//

suite('browser-fs', () => {
  suite('create', () => {
    test('pass memFsInst', () => {
      isLocator(createBrowserFsLocator({ memFsInst: sMemFs.create() }))
        .should.be.true;
    });

    test('no args', () => {
      isLocator(createBrowserFsLocator())
        .should.be.true;
    });
  });

  suite('locate', () => {
    let memFsInst
      , locate
      ;

    setup(() => {
      memFsInst = sMemFs.create({
        '/index.js': 'some code'
        , '/dep.js': 'some more code'
      });

      locate = createBrowserFsLocator({ memFsInst }).locate;
    });

    test('full path', () => {
      locate({
          requestString: '/dep'
          , dependentModuleId: '/index.js'
        })
        .should.deep.equal({
          id: '/dep.js'
          , code: 'some more code'
        });
    });

    test('relative path', () => {
      locate({
          requestString: './dep'
          , dependentModuleId: '/index.js'
        })
        .should.deep.equal({
          id: '/dep.js'
          , code: 'some more code'
        });
    });

    test('non-existent file', () => {
      locate({
          requestString: "./doesn't exist"
          , dependentModuleId: '/index.js'
        })
        .should.be.false;
    });
  });
});
