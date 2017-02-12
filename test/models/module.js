'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , Module = require('../../lib/models/module')
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

suite('Module', () => {
  test('constructor', () => {
    (new Module({ id: 'some id', code: 'some code' }))
      .should.deep.equal(
        {
          id: 'some id'
          , code: 'some code'
          , dependsOn: []
        }
      );

    expect(() => new Module({}))
      .to.throw('The following keys are missing from your Module constructor argument: id, code');
  });
});
