//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , createServerFsLocator = require('../../../lib/factories/locators/server-fs')
  , path = require('path')
  ;

const { isLocator } = require('./helpers');


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();


//------//
// Main //
//------//

suite('server-fs', () => {
  suite('create', () => {
    test('pass extensionsToCheckInOrder', () => {
      isLocator(createServerFsLocator({ extensionsToCheckInOrder: ['.js'] }))
        .should.be.true;
    });

    test('no args', () => {
      isLocator(createServerFsLocator())
        .should.be.true;
    });
  });

  suite('locate', () => {
    const serverFsDir = path.join(__dirname, '../../resources/locators/server-fs')
      , dependentModuleId = serverFsDir + '/entry.js'
      , aDependencyId = serverFsDir + '/a-dependency.js'
      , expectedModule = {
        id: aDependencyId
        , code: 'a-dependency content\n'
      }
      ;

    let locate;

    setup(() => { locate = createServerFsLocator().locate; });

    test('full path', () => {
      return locate({
          dependentModuleId
          , requestString: serverFsDir + '/a-dependency'
        })
        .should.become(expectedModule);
    });

    test('relative path', () => {
      return locate({
          dependentModuleId
          , requestString: './a-dependency'
        })
        .should.become(expectedModule);
    });

    test('with explicit extension', () => {
      return locate({
          dependentModuleId
          , requestString: './a-dependency.js'
        })
        .should.become(expectedModule);
    });

    test('non-existent file', () => {
      return locate({
          dependentModuleId
          , requestString: "./doesn't exist"
        })
        .should.eventually.be.false;
    });
  });
});
