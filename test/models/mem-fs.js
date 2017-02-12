'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , MemFs = require('../../lib/models/mem-fs')
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

suite('MemFs', () => {
  test('constructor', () => {
    (new MemFs()).should.deep.equal({ _fs: {} });

    expect(() => new MemFs({ 'not full path': 'content' }))
      .to.throw('path must be a full path');

    (new MemFs({ '/some/path': 'content' }))
      .should.deep.equal({ _fs: { '/some/path': 'content' } });
  });

  test('addFile', () => {
    const memFsInst = new MemFs();

    expect(() => memFsInst.addFile('not full path', 'content'))
      .to.throw('path must be a full path');

    memFsInst.addFile('/some/path', 'content')
      ._fs.should.deep.equal({ '/some/path': 'content' });
  });

  test('removeFile', () => {
    const memFsInst = (new MemFs()).addFile('/some/path', 'content');

    expect(() => memFsInst.removeFile('not full path'))
      .to.throw('path must be a full path');

    memFsInst.removeFile('/some/path')
      ._fs.should.deep.equal({});
  });

  test('getFile', () => {
    const memFsInst = (new MemFs()).addFile('/some/path', 'content');

    expect(() => memFsInst.getFile('not full path'))
      .to.throw('path must be a full path');

    memFsInst.getFile('/some/path').should.equal('content');
  });

  test('dirname', () => {
    MemFs.dirname('a/b').should.equal('a');
    MemFs.dirname('a/b/').should.equal('a');
    MemFs.dirname('/a').should.equal('/');
  });

  test('joinPaths', () => {
    MemFs.joinPaths(['a', 'b']).should.equal('a/b');
    MemFs.joinPaths(['/a', 'b/']).should.equal('/a/b/');
    MemFs.joinPaths(['/a/', '/b/']).should.equal('/a/b/');
    MemFs.joinPaths(['a', 'b', '..', 'c']).should.equal('a/c');
    MemFs.joinPaths(['a', 'b/..', 'c']).should.equal('a/c');
    MemFs.joinPaths(['a', 'b', '../c']).should.equal('a/c');
    MemFs.joinPaths(['a', './b', '../c']).should.equal('a/c');

    expect(
      () => MemFs.joinPaths(['a', null])
    ).to.throw('joinPaths requires arguments of strings');
  });

  test('resolvePath', () => {
    MemFs.resolvePath('a/b/../c').should.equal('a/c');

    expect(
      () => MemFs.resolvePath('a/b/../../../')
    ).to.throw(
      'invalid path provided: the number of parent directory segments goes'
      + ' beyond the initial segment'
    );
  });
});
