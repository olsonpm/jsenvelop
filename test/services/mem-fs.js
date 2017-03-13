//---------//
// Imports //
//---------//

const arrayOfKeys = require('../../lib/fxns/array-of-keys')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , each = require('../../lib/fxns/each')
  , sMemFs = require('../../lib/services/mem-fs')
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

suite('memFs', () => {
  test('create', () => {
    const aMemFs = sMemFs.create();

    arrayOfKeys(aMemFs).should.deep.equal(['addFile', 'getFile', 'hasFile', 'removeFile']);
  });

  test('dirname', () => {
    shouldAllTransformTo(sMemFs.dirname, [
      ['a/b', 'a']
      , ['a/b/', 'a']
      , ['/a', '/']
      , ['/a.js', '/']
    ]);
  });

  test('joinPaths', () => {
    shouldAllTransformTo(sMemFs.joinPaths, [
      [['a', 'b'], 'a/b']
      , [['/a', 'b/'], '/a/b/']
      , [['/a/', '/b/'], '/a/b/']
      , [['a', 'b', '..', 'c'], 'a/c']
      , [['a', 'b/..', 'c'], 'a/c']
      , [['a', 'b', '../c'], 'a/c']
      , [['a', './b', '../c'], 'a/c']
    ]);

    expect(
      () => sMemFs.joinPaths(['a', null])
    ).to.throw('joinPaths requires arguments of strings');
  });

  test('resolvePath', () => {
    sMemFs.resolvePath('a/b/../c').should.equal('a/c');

    expect(
      () => sMemFs.resolvePath('a/b/../../../')
    ).to.throw(
      'invalid path provided: the number of parent directory segments goes'
      + ' beyond the initial segment'
    );
  });

  suite('memFs instance', () => {
    let initialMemFs
      , memFsInst
      ;

    setup(() => {
      initialMemFs = { '/path/to/resource': 'contents' };
      memFsInst = sMemFs.create(initialMemFs);
    });

    test('hasFile', () => {
      expectFullPath(memFsInst.hasFile);

      memFsInst.hasFile('/path/to/resource')
        .should.be.true;

      memFsInst.hasFile("/doesn't exist")
        .should.be.false;
    });

    test('addFile', () => {
      expectFullPath(memFsInst.addFile);

      memFsInst.addFile('/some/path', 'content')
        .getFile('/some/path').should.equal('content')
        ;
    });

    test('removeFile', () => {
      expectFullPath(memFsInst.removeFile);

      expect(
        memFsInst.removeFile('/path/to/resource')
          .getFile('/path/to/resource')
      ).to.be.undefined;
    });

    test('getFile', () => {
      expectFullPath(memFsInst.getFile);

      memFsInst.getFile('/path/to/resource')
        .should.equal('contents');
    });
  });
});


//-------------//
// Helper Fxns //
//-------------//

function expectFullPath(fn) {
  expect(() => fn('not full path', 'content'))
    .to.throw('path must be a full path');
}

function shouldAllTransformTo(fn, pairs) {
  each(
    ([left, right]) => fn(left).should.equal(right)
    , pairs
  );
}
