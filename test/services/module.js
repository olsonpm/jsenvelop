//---------//
// Imports //
//---------//

const arrayOfKeys = require('../../lib/fxns/array-of-keys')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , deepEql = require('deep-eql')
  , sModule = require('../../lib/services/module')
  ;


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();

const expect = chai.expect;


//------//
// Main //
//------//

suite('module', () => {
  suite('createModule', () => {
    test('without ast', () => {
      deepEql(
        sModule.createModule({ id: 'some id', code: 'some code' })
        , {
          id: 'some id'
          , code: 'some code'
          , dependedBy: new Set()
        }
      ).should.be.true;
    });

    test('with ast', () => {
      deepEql(
        sModule.createModule({
          id: 'some id'
          , code: 'some code'
          , ast: 'some ast'
        })
        , {
          id: 'some id'
          , code: 'some code'
          , ast: 'some ast'
          , dependedBy: new Set()
        }
      ).should.be.true;
    });

    test('missing keys', () => {
      expect(() => sModule.createModule({}))
        .to.throw('The following keys are missing from your Module constructor argument: id, code');
    });
  });

  suite('createModuleContainer', () => {
    let aModuleContainer;

    setup(() => {
      aModuleContainer = sModule.createModuleContainer();
    });

    test('has expected methods', () => {
      deepEql(
        new Set(arrayOfKeys(aModuleContainer))
        , new Set(['addOne', 'removeOne', 'addMany', 'getAll', 'getOne', 'removeMany'])
      ).should.be.true;
    });

    test('addOne', () => {
      aModuleContainer.addOne({ id: 'an id', data: 'some data' })
        .should.equal(aModuleContainer);

      aModuleContainer.getAll().should.deep.equal({
        'an id': {
          id: 'an id'
          , data: 'some data'
        }
      });
    });

    test('getOne', () => {
      const aModule = { id: 'an id', data: 'some data' };

      aModuleContainer.addOne(aModule)
        .getOne('an id')
        .should.equal(aModule);
    });

    test('removeOne', () => {
      aModuleContainer.addOne({ id: 'an id', data: 'some data' })
        .removeOne('an id')
        .should.equal(aModuleContainer)
        ;

      aModuleContainer.getAll().should.deep.equal({});
    });

    test('addMany', () => {
      aModuleContainer.addMany([
          { id: 'an id', data: 'some data' }
          , { id: 'another id', data: 'some more data' }
        ])
        .should.equal(aModuleContainer);

      aModuleContainer.getAll().should.deep.equal({
        'an id': {
          id: 'an id'
          , data: 'some data'
        }
        , 'another id': {
          id: 'another id'
          , data: 'some more data'
        }
      });
    });
  });
});
