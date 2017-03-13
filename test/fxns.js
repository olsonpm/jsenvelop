'use strict';


//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , cloneDeep = require('lodash.clonedeep')
  , curry = require('lodash.curry')
  , deepEql = require('deep-eql') // necessary until chai v4 releases
  , delay = require('delay')
  , kebabCase = require('lodash.kebabcase')
  , mMap = require('../lib/fxns/m-map')
  ;

const [
    all, alwaysReturn, any, arrayOfKeys, arrayOfValues, containedIn, contains
    , createEmpty, curryN, discard, discardWhen, discardFirst, discardLast
    , discardLastWhile, discardFirstWhile, each, findFirstResult, findFirstValue
    , flatten, flip, get, getElementAt, getFrom, hasElementAt, hasKey, head
    , identity, initial, isType, join, keep, keepFirst, keepWhen, last, map
    , mapKeys, merge, mMapAccum, mMerge, mSet, mUnset, nthArg, omit, omitWhen
    , passThrough, pFindFirstResult, pFindFirstValue, ph, pick, pickWhen, pipe
    , reduceFirst, reduceFresh, reduce, reverse, separate, shallowClone, size
    , tail, take, toPairs, toWrittenList, transform, transformArgs, typeCaller
    , type, unique, uniqueById, utils, zipTo
  ] = requireAll([
    'all', 'alwaysReturn', 'any', 'arrayOfKeys', 'arrayOfValues', 'containedIn'
    , 'contains', 'createEmpty', 'curryN', 'discard', 'discardWhen'
    , 'discardFirst', 'discardLast', 'discardLastWhile', 'discardFirstWhile'
    , 'each', 'findFirstResult', 'findFirstValue', 'flatten', 'flip', 'get'
    , 'getElementAt', 'getFrom', 'hasElementAt', 'hasKey', 'head', 'identity'
    , 'initial', 'isType', 'join', 'keep', 'keepFirst', 'keepWhen', 'last'
    , 'map', 'mapKeys', 'merge', 'mMapAccum', 'mMerge', 'mSet', 'mUnset'
    , 'nthArg', 'omit', 'omitWhen', 'passThrough', 'pFindFirstResult'
    , 'pFindFirstValue', 'ph', 'pick', 'pickWhen', 'pipe', 'reduceFirst'
    , 'reduceFresh', 'reduce', 'reverse', 'separate', 'shallowClone', 'size'
    , 'tail', 'take', 'toPairs', 'toWrittenList', 'transform', 'transformArgs'
    , 'typeCaller', 'type', 'unique', 'uniqueById', 'utils', 'zipTo'
  ]);

const {
  adhere, adhereEach, adhereOwnEnumerable, apply, construct, constructN1
  , eachOffset, fromPairs, getAtPath, getEq, getOr, hasPath, ifFalse
  , ifThenTransform, invoke, invokeAtPath, invokeAtPathWith, invokeWith, is
  , isDefined, isEmpty, isLaden, isUndefined, noop, not, pAllSettled, pCatch
  , pProps, pPropsSettled, pReflect, pReject, pResolve, setAtPath, strictEquals
  , then, toBoolean
} = utils;

const {
  concat, frontmostResolvedPromise, mAppend, mAppendAll, mAppendAllTo, mAppendTo
  , mModifyAt, mPrepend, mPrependAll, mPrependAllTo, mPrependTo, mRemoveAt
} = require('../lib/fxns/array');

const {
  allCharsEq, append, endsWith, isMatch, prepend, repeat, startsWith, trimChar
  , trimEndChar, trimEndWhile, trimStartChar, trimStartWhile, trimWhile, wrap
} = require('../lib/fxns/string');

const {
  hasNoCase, isLowercase, isUppercase
} = require('../lib/fxns/character');


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();

const expect = chai.expect
  , inc = x => x + 1
  ;


//------//
// Main //
//------//

suite('fxns', () => {
  suite('misc', () => {
    test('all', () => {
      const eq1 = strictEquals(1);

      all(eq1, { one: 1, anotherOne: 1 }).should.be.true;
      all(eq1, { two: 2 }).should.be.false;

      all(eq1, new Map([['one', 1], ['anotherOne', 1]])).should.be.true;
      all(eq1, new Map([['two', 2]])).should.be.false;

      all(eq1, [1, 1]).should.be.true;
      all(eq1, [2]).should.be.false;

      all(eq1, new Set([1, 1])).should.be.true;
      all(eq1, new Set([2])).should.be.false;
    });

    test('alwaysReturn', () => {
      const obj = {};
      expect(alwaysReturn()()).to.be.undefined;
      alwaysReturn(1)().should.equal(1);
      alwaysReturn(obj)().should.equal(obj);
    });

    test('any', () => {
      const eq1 = strictEquals(1);
      any(eq1, { one: 1, two: 2 }).should.be.true;
      any(eq1, { two: 2 }).should.be.false;

      any(eq1, new Map([['one', 1], ['two', 2]])).should.be.true;
      any(eq1, new Map([['two', 2]])).should.be.false;

      any(eq1, [1, 2]).should.be.true;
      any(eq1, [2]).should.be.false;

      any(eq1, new Set([1, 2])).should.be.true;
      any(eq1, new Set([2])).should.be.false;
    });

    test('arrayOfKeys', () => {
      arrayOfKeys({ one: 1 }).should.deep.equal(['one']);
      arrayOfKeys(new Map([['one', 1]])).should.deep.equal(['one']);
    });

    test('arrayOfValues', () => {
      arrayOfValues({ one: 1, two: 2 }).should.deep.equal([1, 2]);
      arrayOfValues(new Map([['one', 1], ['two', 2]])).should.deep.equal([1, 2]);
      arrayOfValues(new Set([1, 2])).should.deep.equal([1, 2]);
    });

    test('containedIn', () => {
      containedIn({ one: 1, two: 2 }, 1).should.be.true;
      containedIn({ two: 2 }, 1).should.be.false;

      containedIn(new Map([['one', 1], ['two', 2]]), 1).should.be.true;
      containedIn(new Map([['two', 2]]), 1).should.be.false;

      containedIn([1, 2], 1).should.be.true;
      containedIn([2], 1).should.be.false;

      containedIn(new Set([1, 2]), 1).should.be.true;
      containedIn(new Set([2]), 1).should.be.false;
    });

    test('contains', () => {
      contains(1, { one: 1, two: 2 }).should.be.true;
      contains(1, { two: 2 }).should.be.false;

      contains(1, new Map([['one', 1], ['two', 2]])).should.be.true;
      contains(1, new Map([['two', 2]])).should.be.false;

      contains(1, [1, 2]).should.be.true;
      contains(1, [2]).should.be.false;

      contains(1, new Set([1, 2])).should.be.true;
      contains(1, new Set([2])).should.be.false;
    });

    test('createEmpty', () => {
      createEmpty('Object')().should.deep.equal({});
      createEmpty('Array')().should.deep.equal([]);
    });

    test('curryN', () => {
      const returnArgArray = curryN(
        2
        , (...args) => args
      );
      returnArgArray(1, 2).should.deep.equal([1, 2]);
      returnArgArray()(1)(2).should.deep.equal([1, 2]);
      returnArgArray(1, 2, 3).should.deep.equal([1, 2, 3]);
    });

    test('discard', () => {
      const discard1 = discard(new Set([1]));
      discard1({ one: 1, two: 2 }).should.deep.equal({ two: 2 });
      discard1([1, 2]).should.deep.equal([2]);

      deepEql(
        discard1(new Map([['one', 1], ['two', 2]]))
        , new Map([['two', 2]])
      ).should.be.true;

      deepEql(
        discard1(new Set([1, 2]))
        , new Set([2])
      ).should.be.true;
    });

    test('discardWhen', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      discardWhen(wrappedIsOdd, theObject).should.deep.equal({ two: 2 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
        , [3, 'three', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      deepEql(
        discardWhen(wrappedIsOdd, theMap)
        , new Map([['two', 2]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
          , [2, 'two', theMap]
          , [3, 'three', theMap]
        ]
      ).should.be.true;


      const theArray = [1, 2, 3];
      discardWhen(wrappedIsOdd, theArray).should.deep.equal([2]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
        , [2, 1, theArray]
        , [3, 2, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      deepEql(
        discardWhen(wrappedIsOdd, theSet)
        , new Set([2])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 1, theSet]
          , [2, 2, theSet]
          , [3, 3, theSet]
        ]
      ).should.be.true;
    });

    test('discardFirst', () => {
      discardFirst(2, [1, 2, 3]).should.deep.equal([3]);
      discardFirst(2, '123').should.equal('3');
    });

    test('discardLast', () => {
      discardLast(2, [1, 2, 3]).should.deep.equal([1]);
      discardLast(2, '123').should.equal('1');
    });

    test('discardLastWhile', () => {
      discardLastWhile(isOdd, [2, 1, 3]).should.deep.equal([2]);
      discardLastWhile(isUppercase, 'aaaAAA').should.equal('aaa');
    });

    test('discardFirstWhile', () => {
      discardFirstWhile(isOdd, [1, 3, 2]).should.deep.equal([2]);
      discardFirstWhile(isLowercase, 'aaaAAA').should.equal('AAA');
    });

    test('each', () => {
      //
      // Map
      //
      let argCollector = createArgCollector()
        , theMap = new Map([['one', 1], ['two', 2]]);

      each(
        argCollector.cb
        , theMap
      );

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
          , [2, 'two', theMap]
        ]
      ).should.be.true;

      //
      // Object
      //
      const theObject = { one: 1, two: 2 };

      each(
        argCollector.cb
        , theObject
      );

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
      ]);

      //
      // Array
      //
      const theArray = ['zero', 'one'];

      each(
        argCollector.cb
        , theArray
      );

      argCollector.extractArgsPerCall().should.deep.equal([
        ['zero', 0, theArray]
        , ['one', 1, theArray]
      ]);

      //
      // Set
      //
      const theSet = new Set(['one', 'two']);

      each(
        argCollector.cb
        , theSet
      );

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          ['one', 'one', theSet]
          , ['two', 'two', theSet]
        ]
      ).should.be.true;
    });

    test('findFirstResult', () => {
      const virtualFs = {
          '/index.json': '{ "some": "json" }'
        }
        , readVirtualFile = getFrom(virtualFs)
        ;

      //
      // seems familiar?  See the section LOAD_AS_FILE
      // https://nodejs.org/api/modules.html#modules_all_together
      //
      const mapOfOrderedFilesToTry = new Map([
        ['no extension', '/index']
        , ['.js', '/index.js']
        , ['.json', '/index.json']
      ]);
      findFirstResult(readVirtualFile, mapOfOrderedFilesToTry)
        .should.equal('{ "some": "json" }');

      const arrayOfOrderedFilesToTry = ['/index', '/index.js', '/index.json'];
      findFirstResult(readVirtualFile, arrayOfOrderedFilesToTry)
        .should.equal('{ "some": "json" }');

      const setOfOrderedFilesToTry = new Set(
        ['/index', '/index.js', '/index.json']
      );
      findFirstResult(readVirtualFile, setOfOrderedFilesToTry)
        .should.equal('{ "some": "json" }');
    });

    test('findFirstValue', () => {
      const aMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      findFirstValue(isEven, aMap).should.equal(2);

      const arr = [1, 2, 3];
      findFirstValue(isEven, arr).should.equal(2);

      const aSet = new Set([1, 2, 3]);
      findFirstValue(isEven, aSet).should.equal(2);
    });

    test('flatten', () => {
      flatten([1, 2, 3]).should.deep.equal([1, 2, 3]);
      flatten([1, [2], 3]).should.deep.equal([1, 2, 3]);
      flatten([1, [[2]], 3]).should.deep.equal([1, [2], 3]);
    });

    test('flip', () => {
      const myConcat = (left, right) => left.concat(right)
        , myPrepend = flip(myConcat);

      myPrepend([1], [2]).should.deep.equal([2, 1]);
    });

    test('get', () => {
      const person = {
        name: 'matt'
      };
      get('name', person).should.equal('matt');
      expect(get("doesn't exist", person)).to.be.undefined;
      expect(get('name', undefined)).to.be.undefined;
    });

    test('getElementAt', () => {
      getElementAt('one', new Map([['one', 1]])).should.equal(1);
      getElementAt(0, [0]).should.equal(0);
      expect(
        () => getElementAt('zero', [0])
      ).to.throw('getElementAt for an array requires idx to parse as an integer');
    });

    test('getFrom', () => {
      const person = {
        name: 'matt'
      };
      getFrom(person, 'name').should.equal('matt');
      expect(getFrom(undefined, 'name')).to.be.undefined;
      expect(getFrom(person, "doesn't exist")).to.be.undefined;
    });

    test('hasElementAt', () => {
      const theMap = new Map([['one', 1]]);
      hasElementAt('one', theMap).should.be.true;
      hasElementAt('two', theMap).should.be.false;

      const theArr = [0];
      hasElementAt(0, theArr).should.be.true;
      hasElementAt(1, theArr).should.be.false;
      expect(
        () => hasElementAt('zero', [0])
      ).to.throw('hasElementAt for an array requires idx to parse as an integer');
    });

    test('hasKey', () => {
      const person = {
        name: 'matt'
      };
      hasKey('name', person).should.be.true;
      hasKey("doesn't exist", person).should.be.false;

      // doesn't have to be enumerable
      hasKey('toString', true).should.be.true;
      hasKey("doesn't exist", true).should.be.false;
    });

    test('head', () => {
      head([1, 2]).should.equal(1);
      head('ab').should.equal('a');

      expect(head([])).to.be.undefined;
      expect(head('')).to.be.undefined;
    });

    test('initial', () => {
      initial([1, 2, 3]).should.deep.equal([1, 2]);
      initial('abc').should.equal('ab');

      initial([]).should.deep.equal([]);
      initial('').should.equal('');
    });

    test('isType', () => {
      isType('String', '1').should.be.true;
      isType('String', 1).should.be.false;
      isType('Number', 1).should.be.true;
    });

    test('join', () => {
      join(', ', [1, 2, 3]).should.equal('1, 2, 3');
      join(', ', new Set([1, 2, 3])).should.equal('1, 2, 3');
    });

    test('keep', () => {
      const keep1 = keep(new Set([1]));
      keep1({ one: 1, two: 2 }).should.deep.equal({ one: 1 });
      keep1([1, 2]).should.deep.equal([1]);

      deepEql(
        keep1(new Map([['one', 1], ['two', 2]]))
        , new Map([['one', 1]])
      ).should.be.true;

      deepEql(
        keep1(new Set([1, 2]))
        , new Set([1])
      ).should.be.true;
    });

    test('keepFirst', () => {
      keepFirst(2, [1, 2, 3]).should.deep.equal([1, 2]);
      keepFirst(2, '123').should.equal('12');
    });

    test('keepWhen', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      keepWhen(wrappedIsOdd, theObject).should.deep.equal({ one: 1, three: 3 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
        , [3, 'three', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);

      deepEql(
        keepWhen(wrappedIsOdd, theMap)
        , new Map([['one', 1], ['three', 3]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
          , [2, 'two', theMap]
          , [3, 'three', theMap]
        ]
      ).should.be.true;


      const theArray = [1, 2, 3];
      keepWhen(wrappedIsOdd, theArray).should.deep.equal([1, 3]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
        , [2, 1, theArray]
        , [3, 2, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      deepEql(
        keepWhen(wrappedIsOdd, theSet)
        , new Set([1, 3])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 1, theSet]
          , [2, 2, theSet]
          , [3, 3, theSet]
        ]
      ).should.be.true;
    });

    test('last', () => {
      last([1, 2]).should.equal(2);
      last('ab').should.equal('b');

      expect(last([])).to.be.undefined;
      expect(last('')).to.be.undefined;
    });

    test('map', () => {
      //
      // Map
      //
      const argCollector = createArgCollector()
        , wrappedInc = argCollector.wrap(x => x + 1)
        , theMap = new Map([['one', 1], ['two', 2]])
        ;

      deepEql(
        map(wrappedInc, theMap)
        , new Map([['one', 2], ['two', 3]])
      ).should.be.true;

      deepEql(
        theMap
        , new Map([['one', 1], ['two', 2]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
          , [2, 'two', theMap]
        ]
      ).should.be.true;

      //
      // Object
      //
      const theObject = { one: 1, two: 2 };

      map(wrappedInc, theObject).should.deep.equal({ one: 2, two: 3 });
      theObject.should.deep.equal({ one: 1, two: 2 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
      ]);

      //
      // Array
      //
      const theArray = [0, 1];

      map(wrappedInc, theArray).should.deep.equal([1, 2]);
      theArray.should.deep.equal([0, 1]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 0, theArray]
        , [1, 1, theArray]
      ]);
    });

    test('mapKeys', () => {
      //
      // Map
      //
      const argCollector = createArgCollector()
        , englishToSpanish = {
          one: 'uno'
          , two: 'dos'
        }
        , wrappedEnglishToSpanish = argCollector.wrap(getFrom(englishToSpanish))
        , theMap = new Map([['one', 1], ['two', 2]])
        ;

      deepEql(
        mapKeys(wrappedEnglishToSpanish, theMap)
        , new Map([['uno', 1], ['dos', 2]])
      ).should.be.true;

      deepEql(
        theMap
        , new Map([['one', 1], ['two', 2]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          ['one', 1, theMap]
          , ['two', 2, theMap]
        ]
      ).should.be.true;

      //
      // Object
      //
      const theObject = { one: 1, two: 2 };

      mapKeys(wrappedEnglishToSpanish, theObject).should.deep.equal({ uno: 1, dos: 2 });
      theObject.should.deep.equal({ one: 1, two: 2 });

      argCollector.extractArgsPerCall().should.deep.equal([
        ['one', 1, theObject]
        , ['two', 2, theObject]
      ]);
    });

    test('merge', () => {
      let target = { one: 2, three: 3 };
      merge(target, { one: 1, two: 2 })
        .should.deep.equal({ one: 1, two: 2, three: 3 });

      target.should.deep.equal({ one: 2, three: 3 });

      target = new Map([['one', 2], ['three', 3]]);
      deepEql(
        merge(target, new Map([['one', 1], ['two', 2]]))
        , new Map([['one', 1], ['two', 2], ['three', 3]])
      ).should.be.true;

      deepEql(target, new Map([['one', 2], ['three', 3]]))
        .should.be.true;
    });

    test('mMap', () => {
      //
      // Map
      //
      const argCollector = createArgCollector()
        , wrappedInc = argCollector.wrap(x => x + 1)
        , theMap = new Map([['one', 1], ['two', 2]])
        ;

      deepEql(
        mMap(wrappedInc, theMap)
        , new Map([['one', 2], ['two', 3]])
      ).should.be.true;

      deepEql(
        theMap
        , new Map([['one', 2], ['two', 3]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', new Map([['one', 1], ['two', 2]])]
          , [2, 'two', new Map([['one', 2], ['two', 2]])]
        ]
      ).should.be.true;

      //
      // Object
      //
      const theObject = { one: 1, two: 2 };

      mMap(wrappedInc, theObject).should.deep.equal({ one: 2, two: 3 });
      theObject.should.deep.equal({ one: 2, two: 3 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', { one: 1, two: 2 }]
        , [2, 'two', { one: 2, two: 2 }]
      ]);

      //
      // Array
      //
      const theArray = [0, 1];

      mMap(wrappedInc, theArray).should.deep.equal([1, 2]);
      theArray.should.deep.equal([1, 2]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 0, [0, 1]]
        , [1, 1, [1, 1]]
      ]);
    });

    test('mMapAccum', () => {
      const argCollector = createArgCollector();

      const wrappedAdd = argCollector.wrap((a, b) => a + b);

      const theObj = { first: 1, second: 2, third: 3 };
      mMapAccum(wrappedAdd, 0, theObj);
      theObj.should.deep.equal(
        { first: 1, second: 3, third: 6 }
      );

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 1, 'first', { first: 1, second: 2, third: 3 }]
        , [1, 2, 'second', { first: 1, second: 2, third: 3 }]
        , [3, 3, 'third', { first: 1, second: 3, third: 3 }]
      ]);


      const theMap = new Map([['first', 1], ['second', 2], ['third', 3]]);
      mMapAccum(wrappedAdd, 0, theMap);
      deepEql(theMap, new Map([['first', 1], ['second', 3], ['third', 6]]));

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [0, 1, 'first', new Map([['first', 1], ['second', 2], ['third', 3]])]
          , [1, 2, 'first', new Map([['first', 1], ['second', 2], ['third', 3]])]
          , [3, 3, 'first', new Map([['first', 1], ['second', 3], ['third', 3]])]
        ]
      );


      const theArray = [1, 2, 3];
      mMapAccum(wrappedAdd, 0, theArray);
      theArray.should.deep.equal([1, 3, 6]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 1, 0, [1, 2, 3]]
        , [1, 2, 1, [1, 2, 3]]
        , [3, 3, 2, [1, 3, 3]]
      ]);
    });

    test('mMerge', () => {
      mMerge(
        { one: 2, three: 3 }
        , { one: 1, two: 2 }
      ).should.deep.equal({ one: 1, two: 2, three: 3 });

      deepEql(
        mMerge(
          new Map([['one', 2], ['three', 3]])
          , new Map([['one', 1], ['two', 2]])
        )
        , new Map([['one', 1], ['two', 2], ['three', 3]])
      ).should.be.true;
    });

    test('mSet', () => {
      const obj = {};
      mSet(
        'one'
        , 1
        , obj
      ).should.deep.equal({ one: 1 });

      obj.should.deep.equal({ one: 1 });
    });

    test('mUnset', () => {
      const obj = { one: 1 };
      mUnset('one', obj).should.deep.equal({});

      obj.should.deep.equal({});
    });

    test('nthArg', () => {
      nthArg(1)('a', 'b').should.equal('a');
      nthArg(2)('a', 'b').should.equal('b');
    });

    test('omit', () => {
      const setOfWrittenEnglishNumbers = new Set(['one', 'three'])
        , setOfEvenNumbers = new Set([0, 2]);

      omit(
        setOfWrittenEnglishNumbers
        , { one: 1, dos: 2, three: 3 }
      ).should.deep.equal({ dos: 2 });

      deepEql(
        omit(
          setOfWrittenEnglishNumbers
          , new Map([['one', 1], ['dos', 2], ['three', 3]])
        )
        , new Map([['dos', 2]])
      ).should.be.true;

      omit(
        setOfEvenNumbers
        , ['zero', 'one', 'two']
      ).should.deep.equal(['one']);
    });

    test('omitWhen', () => {
      const argCollector = createArgCollector()
        , isEnglishNumber = argCollector.wrap(
          adhere('has', new Set(['one', 'two', 'three']))
        )
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, dos: 2, three: 3};
      omitWhen(isEnglishNumber, theObject).should.deep.equal({ dos: 2 });

      argCollector.extractArgsPerCall().should.deep.equal([
        ['one', 1, theObject]
        , ['dos', 2, theObject]
        , ['three', 3, theObject]
      ]);


      const theMap = new Map([['one', 1], ['dos', 2], ['three', 3]]);
      deepEql(
        omitWhen(isEnglishNumber, theMap)
        , new Map([['dos', 2]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          ['one', 1, theMap]
          , ['dos', 2, theMap]
          , ['three', 3, theMap]
        ]
      ).should.be.true;


      const theArray = ['zero', 'one', 'two'];
      omitWhen(wrappedIsOdd, theArray).should.deep.equal(['zero', 'two']);

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 'zero', theArray]
        , [1, 'one', theArray]
        , [2, 'two', theArray]
      ]);
    });

    test('passThrough', () => {
      const puppyToKitty = str => (str === 'puppy')
        ? 'kitty'
        : str;

      passThrough('puppy', [identity]).should.equal('puppy');
      passThrough(
        'puppy'
        , [
          str => {
            str.should.equal('puppy');
            return str;
          }
          , puppyToKitty
        ]
      ).should.equal('kitty');
    });

    test('pFindFirstResult', () => {
      const virtualFs = {
          '/index.json': '{ "some": "json" }'
        }
        , pReadVirtualFile = pipe([getFrom(virtualFs), pResolve])
        ;

      //
      // seems familiar?  See the section LOAD_AS_FILE
      // https://nodejs.org/api/modules.html#modules_all_together
      //
      const mapOfOrderedFilesToTry = new Map([
        ['no extension', '/index']
        , ['.js', '/index.js']
        , ['.json', '/index.json']
      ]);
      const p1 = pFindFirstResult(pReadVirtualFile, mapOfOrderedFilesToTry)
        .should.become('{ "some": "json" }');

      const arrayOfOrderedFilesToTry = ['/index', '/index.js', '/index.json'];
      const p2 = pFindFirstResult(pReadVirtualFile, arrayOfOrderedFilesToTry)
        .should.become('{ "some": "json" }');

      const setOfOrderedFilesToTry = new Set(
        ['/index', '/index.js', '/index.json']
      );
      const p3 = pFindFirstResult(pReadVirtualFile, setOfOrderedFilesToTry)
        .should.become('{ "some": "json" }');

      return Promise.all([p1, p2, p3]);
    });

    test('pFindFirstValue', () => {
      const pIsEven = num => Promise.resolve(!(num % 2));

      const aMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      pFindFirstValue(pIsEven, aMap)
        .should.eventually.equal(2);

      const arr = [1, 2, 3];
      pFindFirstValue(pIsEven, arr)
        .should.eventually.equal(2);

      const aSet = new Set([1, 2, 3]);
      pFindFirstValue(pIsEven, aSet)
        .should.eventually.equal(2);
    });

    test('ph', () => {
      const subtract = curry(
          (left, right) => left - right
        )
        , subtract2from = subtract(ph, 2);

      subtract2from(3).should.equal(1);
    });

    test('pick', () => {
      const setOfWrittenEnglishNumbers = new Set(['one', 'three'])
        , setOfEvenNumbers = new Set([0, 2]);

      pick(
        setOfWrittenEnglishNumbers
        , { one: 1, dos: 2, three: 3 }
      ).should.deep.equal({ one: 1, three: 3 });

      deepEql(
        pick(
          setOfWrittenEnglishNumbers
          , new Map([['one', 1], ['dos', 2], ['three', 3]])
        )
        , new Map([['one', 1], ['three', 3]])
      ).should.be.true;

      pick(
        setOfEvenNumbers
        , ['zero', 'one', 'two']
      ).should.deep.equal(['zero', 'two']);
    });

    test('pickWhen', () => {
      const argCollector = createArgCollector()
        , isEnglishNumber = argCollector.wrap(
          adhere('has', new Set(['one', 'two', 'three']))
        )
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, dos: 2, three: 3};
      pickWhen(isEnglishNumber, theObject).should.deep.equal({ one: 1, three: 3 });

      argCollector.extractArgsPerCall().should.deep.equal([
        ['one', 1, theObject]
        , ['dos', 2, theObject]
        , ['three', 3, theObject]
      ]);


      const theMap = new Map([['one', 1], ['dos', 2], ['three', 3]]);
      deepEql(
        pickWhen(isEnglishNumber, theMap)
        , new Map([['one', 1], ['three', 3]])
      ).should.be.true;

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          ['one', 1, theMap]
          , ['dos', 2, theMap]
          , ['three', 3, theMap]
        ]
      ).should.be.true;


      const theArray = ['zero', 'one', 'two'];
      pickWhen(wrappedIsOdd, theArray).should.deep.equal(['one']);

      argCollector.extractArgsPerCall().should.deep.equal([
        [0, 'zero', theArray]
        , [1, 'one', theArray]
        , [2, 'two', theArray]
      ]);
    });

    test('pipe', () => {
      const puppyToKitty = str => (str === 'puppy')
        ? 'kitty'
        : str;

      pipe([])('puppy').should.equal('puppy');
      pipe([])('puppy', 'kitty').should.equal('puppy');
      pipe([identity])('puppy').should.equal('puppy');
      pipe([append])('puppy', 'kitty').should.equal('kittypuppy');
      pipe([append, identity])('puppy', 'kitty').should.equal('kittypuppy');
      pipe([
          str => {
            str.should.equal('puppy');
            return str;
          }
          , puppyToKitty
        ])('puppy')
        .should.equal('kitty')
        ;
    });

    test('reduceFirst', () => {
      const argCollector = createArgCollector()
        , wrappedCommaJoin = argCollector.wrap((a, b) => a + ', ' + b);

      const theObject = { one: 1, two: 2, three: 3};
      reduceFirst(
        wrappedCommaJoin
        , theObject
      ).should.equal('1, 2, 3');

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 2, 'two', theObject]
        , ['1, 2', 3, 'three', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      reduceFirst(
        wrappedCommaJoin
        , theMap
      ).should.equal('1, 2, 3');

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 2, 'two', theMap]
          , ['1, 2', 3, 'three', theMap]
        ]
      ).should.be.true;


      const theArray = [1, 2, 3];
      reduceFirst(
        wrappedCommaJoin
        , theArray
      ).should.equal('1, 2, 3');

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 2, 1, theArray]
        , ['1, 2', 3, 2, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      reduceFirst(
        wrappedCommaJoin
        , theSet
      ).should.equal('1, 2, 3');

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 2, 2, theSet]
          , ['1, 2', 3, 3, theSet]
        ]
      ).should.be.true;
    });

    test('reduceFresh', () => {
      testReducer(
        reduceFresh
        , () => ({
          obj: () => ({})
          , arr: () => []
        })
      );
    });

    test('reduce', () => {
      testReducer(
        reduce
        , () => ({
          obj: {}
          , arr: []
        })
      );
    });

    test('reverse', () => {
      reverse([1, 2, 3]).should.deep.equal([3, 2, 1]);
      reverse('123').should.equal('321');
    });

    test('separate', () => {
      separate('/', '/ab/c/').should.deep.equal(['ab', 'c']);
      separate('/', 'ab/c').should.deep.equal(['ab', 'c']);
      separate('/', '').should.deep.equal([]);

      separate(null, [null, 1, 2, null, 3, null]).should.deep.equal([[1, 2], [3]]);
    });

    test('shallowClone', () => {
      const arr = [1, 2, 3]
        , clonedArr = shallowClone(arr)
        ;

      clonedArr[0] = 0;
      arr.should.deep.equal([1, 2, 3]);
      clonedArr.should.deep.equal([0, 2, 3]);


      const obj = { my: 'name is slim shady' }
        , clonedObj = shallowClone(obj)
        ;

      clonedObj.my = 'name is phil';
      obj.should.deep.equal({ my: 'name is slim shady' });
      clonedObj.should.deep.equal({ my: 'name is phil' });


      const aMap = new Map([['please', 'stand up']])
        , clonedMap = shallowClone(aMap)
        ;

      clonedMap.set('please', 'do the dishes');
      deepEql(aMap, new Map([['please', 'stand up']]));
      deepEql(clonedMap, new Map([['please', 'do the dishes']]));


      const aSet = new Set([1, 2, 3])
        , clonedSet = shallowClone(aSet)
        ;

      clonedSet.delete(3);
      deepEql(aSet, new Set([1, 2, 3]));
      deepEql(clonedSet, new Set([1, 2]));
    });

    test('size', () => {
      size({}).should.equal(0);
      size({ one: 1 }).should.equal(1);

      size(new Map()).should.equal(0);
      size(new Map([['one', 1]])).should.equal(1);

      size([]).should.equal(0);
      size([1]).should.equal(1);

      size(new Set()).should.equal(0);
      size(new Set([1])).should.equal(1);

      size('').should.equal(0);
      size('1').should.equal(1);

      size(undefined).should.equal(0);
      size(null).should.equal(0);
    });

    test('tail', () => {
      tail([1, 2, 3]).should.deep.equal([2, 3]);
      tail('abc').should.equal('bc');

      tail([]).should.deep.equal([]);
      tail('').should.equal('');
    });

    test('take', () => {
      take(2, [1, 2, 3]).should.deep.equal([1, 2]);
      take(2, 'abc').should.equal('ab');
    });

    test('toPairs', () => {
      toPairs({ one: 1, two: '2' }).should.deep.equal([['one', 1], ['two', '2']]);
      toPairs(new Map([['one', 1], ['two', '2']])).should.deep.equal([['one', 1], ['two', '2']]);
    });

    test('toWrittenList', () => {
      toWrittenList(['Phil']).should.equal('Phil');
      toWrittenList(['Phil', 'Matt']).should.equal('Phil and Matt');
      toWrittenList(['Phil', 'Matt', 'Chris'])
        .should.equal('Phil, Matt and Chris');
      toWrittenList(['Phil', 'Matt', 'Chris', 'Sam'])
        .should.equal('Phil, Matt, Chris and Sam');

      toWrittenList(new Set(['Phil'])).should.equal('Phil');
      toWrittenList(new Set(['Phil', 'Matt'])).should.equal('Phil and Matt');
      toWrittenList(new Set(['Phil', 'Matt', 'Chris']))
        .should.equal('Phil, Matt and Chris');
      toWrittenList(new Set(['Phil', 'Matt', 'Chris', 'Sam']))
        .should.equal('Phil, Matt, Chris and Sam');
    });

    test('transform', () => {
      //
      // Map
      //
      const mapOfTransforms = new Map([
          ['name', invoke('toUpperCase')]
          , ['age', inc]
        ])
        , theMap = new Map([['name', 'matt'], ['age', 27]])
        ;

      deepEql(
        transform(mapOfTransforms, theMap)
        , new Map([['name', 'MATT'], ['age', 28]])
      ).should.be.true;

      //
      // Object
      //
      const objOfTransforms = {
          name: invoke('toUpperCase')
          , age: inc
        }
        , theObj = {
          name: 'matt'
          , age: 27
        }
        ;

      transform(objOfTransforms, theObj).should.deep.equal({
        name: 'MATT'
        , age: 28
      });

      //
      // Array
      //
      const arrOfTransforms = [invoke('toUpperCase'), inc]
        , theArr = ['matt', 27]
        ;

      transform(arrOfTransforms, theArr)
        .should.deep.equal(['MATT', 28]);
    });

    test('transformArgs', () => {
      const argTransforms = {
          '0': invoke('toUpperCase')
          , '1': inc
        }
        , createPerson = (name, age) => ({ name, age })
        ;

      transformArgs(argTransforms, createPerson)('matt', 27)
        .should.deep.equal({
          name: 'MATT'
          , age: 28
        });
    });

    test('typeCaller', () => {
      const getCollectionTypeMapper = () => ({
        Object: alwaysReturn('an object')
        , Array: alwaysReturn('an array')
      });

      const anObjectOrArray = typeCaller('nothin', 1, getCollectionTypeMapper);

      anObjectOrArray({}).should.equal('an object');
      anObjectOrArray([]).should.equal('an array');
    });

    test('unique', () => {
      const aMap = new Map([['one', 1], ['two', 2], ['duplicate 1', 1]]);
      deepEql(
        unique(aMap)
        , new Map([['one', 1], ['two', 2]])
      ).should.be.true;

      const anObj = { one: 1, two: 2, dupe1: 1 };
      unique(anObj).should.deep.equal({ one: 1, two: 2 });

      const anArray = [1, 2, 1];
      unique(anArray).should.deep.equal([1, 2]);
    });

    test('uniqueById', () => {
      const matt = {
          name: 'matt'
          , age: 27
        }
        , phil = {
          name: 'phil'
          , age: 29
        }
        , matt2 = {
          name: 'matt'
          , age: 27
        }
        , idFn = ({ name, age }) => `name: ${name}, age: ${age}`
        ;
      const aMap = new Map([['matt', matt], ['phil', phil], ['matt2', matt2]]);
      deepEql(
        uniqueById(idFn, aMap)
        , new Map([['matt', matt], ['phil', phil]])
      ).should.be.true;

      const anObj = { matt, phil, matt2 };
      uniqueById(idFn, anObj).should.deep.equal({ matt, phil });

      const anArray = [matt, phil, matt2];
      uniqueById(idFn, anArray).should.deep.equal([matt, phil]);
    });

    test('zipTo', () => {
      zipTo('Array', ['one', 'two'], [1, 2]).should.deep.equal([
        ['one', 1], ['two', 2]
      ]);

      zipTo('Object', ['one', 'two'], [1, 2]).should.deep.equal({
        one: 1
        , two: 2
      });

      deepEql(
        zipTo('Map', ['one', 'two'], [1, 2])
        , new Map([['one', 1], ['two', 2]])
      );
    });
  });

  suite('char', () => {
    test('hasNoCase', () => {
      hasNoCase('1').should.be.true;
      hasNoCase('a').should.be.false;
      hasNoCase('A').should.be.false;
    });

    test('isLowercase', () => {
      isLowercase('1').should.be.false;
      isLowercase('a').should.be.true;
      isLowercase('A').should.be.false;
    });

    test('isUppercase', () => {
      isUppercase('1').should.be.false;
      isUppercase('a').should.be.false;
      isUppercase('A').should.be.true;
    });
  });

  suite('array', () => {
    test('concat', () => {
      concat([1], [2]).should.deep.equal([1, 2]);
    });

    test('frontmostResolvedPromise', () => {
      let secondRan = false
        , neverRan = false
        ;

      const res1 = frontmostResolvedPromise([
          delay(50).then(() => { secondRan = true; return 'second'; })
          , delay(10, 'first')
          , delay(100).then(() => { neverRan = true; return 'never'; })
        ])
        .then(res => {
          res.should.equal('second');
          secondRan.should.be.true;
          neverRan.should.be.false;
        });

      const res2 = frontmostResolvedPromise([
          delay(50).then(() => { secondRan = true; return Promise.reject('second'); })
          , delay(10, 'first')
          , delay(100).then(() => { neverRan = true; return 'never'; })
        ])
        .then(res => {
          res.should.equal('first');
          secondRan.should.be.true;
          neverRan.should.be.false;
        });

      return Promise.all([res1, res2]);
    });

    test('mAppend', () => {
      const arrOf1 = [1];
      mAppend(2, arrOf1);
      arrOf1.should.deep.equal([1, 2]);
    });

    test('mAppendAll', () => {
      const arrOf1 = [1];
      mAppendAll([2, 3], arrOf1);
      arrOf1.should.deep.equal([1, 2, 3]);
    });

    test('mAppendAllTo', () => {
      const arrOf1 = [1];
      mAppendAllTo(arrOf1, [2, 3]);
      arrOf1.should.deep.equal([1, 2, 3]);
    });

    test('mAppendTo', () => {
      const arrOf1 = [1];
      mAppendTo(arrOf1, 2);
      arrOf1.should.deep.equal([1, 2]);
    });

    test('mModifyAt', () => {
      const arrOf2 = [1, 2];
      mModifyAt(inc, 0, arrOf2)
        .should.deep.equal([2, 2]);

      arrOf2.should.deep.equal([2, 2]);
    });

    test('mPrepend', () => {
      const arrOf2 = [2];
      mPrepend(1, arrOf2);
      arrOf2.should.deep.equal([1, 2]);
    });

    test('mPrependAll', () => {
      const arrOf3 = [3];
      mPrependAll([1, 2], arrOf3);
      arrOf3.should.deep.equal([1, 2, 3]);
    });

    test('mPrependAllTo', () => {
      const arrOf3 = [3];
      mPrependAllTo(arrOf3, [1, 2]);
      arrOf3.should.deep.equal([1, 2, 3]);
    });

    test('mPrependTo', () => {
      const arrOf2 = [2];
      mPrependTo(arrOf2, 1);
      arrOf2.should.deep.equal([1, 2]);
    });

    test('mRemoveAt', () => {
      const arr = [1, 2, 3];
      mRemoveAt(1, arr);
      arr.should.deep.equal([1, 3]);
    });
  });

  suite('string', () => {
    test('allCharsEq', () => {
      allCharsEq('1', '11').should.be.true;
      allCharsEq('1', '12').should.be.false;
    });

    test('append', () => {
      append('b', 'a').should.equal('ab');
    });

    test('endsWith', () => {
      endsWith('a', 'ba').should.be.true;
      endsWith('ba', 'cba').should.be.true;
      endsWith('ba', 'abc').should.be.false;
      expect(() => endsWith('', 'abc')).to.throw(/^endsWith requires a 'mightEndWithThis' string of length >= 1/);
    });

    test('isMatch', () => {
      isMatch(/a/, 'bab').should.be.true;
      isMatch(/a/, 'bob').should.be.false;
    });

    test('prepend', () => {
      prepend('a', 'b').should.equal('ab');
    });

    test('repeat', () => {
      repeat(3, 'a').should.equal('aaa');
      repeat(2, 'ab').should.equal('abab');
    });

    test('startsWith', () => {
      startsWith('a', 'ab').should.be.true;
      startsWith('ab', 'ab').should.be.true;
      startsWith('ab', 'cba').should.be.false;
      expect(() => startsWith('', 'abc')).to.throw(/^startsWith requires a 'mightStartWithThis' string of length >= 1/);
    });

    test('trimChar', () => {
      trimChar('a', 'bab').should.equal('bab');
      trimChar('a', 'aba').should.equal('b');
      trimChar('a', 'aaa').should.equal('');
    });

    test('trimEndChar', () => {
      trimEndChar('a', 'bab').should.equal('bab');
      trimEndChar('a', 'aba').should.equal('ab');
      trimEndChar('a', 'aaa').should.equal('');
    });

    test('trimEndWhile', () => {
      const isA = isMatch(/a/);
      trimEndWhile(isA, 'bab').should.equal('bab');
      trimEndWhile(isA, 'aba').should.equal('ab');
      trimEndWhile(isA, 'aaa').should.equal('');
    });

    test('trimStartChar', () => {
      trimStartChar('a', 'bab').should.equal('bab');
      trimStartChar('a', 'aba').should.equal('ba');
      trimStartChar('a', 'aaa').should.equal('');
    });

    test('trimStartWhile', () => {
      const isA = isMatch(/a/);
      trimStartWhile(isA, 'bab').should.equal('bab');
      trimStartWhile(isA, 'aba').should.equal('ba');
      trimStartWhile(isA, 'aaa').should.equal('');
    });

    test('trimWhile', () => {
      const isA = isMatch(/a/);
      trimWhile(isA, 'bab').should.equal('bab');
      trimWhile(isA, 'aba').should.equal('b');
      trimWhile(isA, 'aaa').should.equal('');
    });

    test('wrap', () => {
      wrap('b', 'a').should.equal('bab');
      wrap('ba', 'ca').should.equal('bacaba');
    });
  });

  suite('utils', () => {
    test('adhere', () => {
      const person = {
        name: 'matt'
        , getName() { return this.name; }
      };
      const getName = adhere('getName', person);
      getName().should.equal('matt');
    });

    test('adhereEach', () => {
      const person = {
        name: 'matt'
        , getName() { return this.name; }
        , screamName() { return this.name + '!'; }
      };

      const { getName, screamName } = adhereEach(['getName', 'screamName'], person);
      getName().should.equal('matt');
      screamName().should.equal('matt!');
    });

    test('adhereOwnEnumerable', () => {
      const person = {
        name: 'matt'
        , getName() { return this.name; }
        , screamName() { return this.name + '!'; }
      };

      const adheredPerson = adhereOwnEnumerable(person);

      arrayOfKeys(adheredPerson).should.deep.equal(['getName', 'screamName']);
      adheredPerson.getName().should.equal('matt');
      adheredPerson.screamName().should.equal('matt!');
    });

    test('apply', () => {
      const add = curry((a, b) => a + b);
      apply([1, 2], add).should.equal(3);
      apply([1], add)(2).should.equal(3);
    });

    test('construct', () => {
      function Person(name, age) {
        mMerge(this, { name, age });
      }

      construct(Person, ['matt', 27]).should.deep.equal({
        name: 'matt'
        , age: 27
      });
    });

    test('constructN1', () => {
      function Person(toMerge) {
        mMerge(this, toMerge);
      }

      constructN1(Person, { name: 'matt', age: 27 }).should.deep.equal({
        name: 'matt'
        , age: 27
      });
    });

    test('eachOffset', () => {
      const theArray = ['zero', 'one', 'two']
        , argCollector = createArgCollector();

      eachOffset(
        argCollector.cb
        , theArray
        , 1
      );

      argCollector.extractArgsPerCall().should.deep.equal([
        ['one', 1, theArray]
        , ['two', 2, theArray]
      ]);
    });

    test('fromPairs', () => {
      fromPairs([['one', 1], ['two', '2']])
        .should.deep.equal({ one: 1, two: '2' });
    });

    test('getAtPath', () => {
      const deepPerson = {
        deeper: {
          name: 'matt'
        }
      };

      getAtPath(['deeper'], deepPerson).should.deep.equal({ name: 'matt' });
      getAtPath(['deeper', 'name'], deepPerson).should.equal('matt');
      expect(getAtPath(["doesn't exist"], deepPerson)).to.be.undefined;
      expect(getAtPath(['deeper', 'name'], undefined)).to.be.undefined;
    });

    test('getEq', () => {
      const person = {
        name: 'matt'
      };
      getEq('name', 'matt', person).should.be.true;
      expect(getEq("doesn't exist", 'anything could be here', person)).to.be.undefined;
      getEq('name', 'not matt', person).should.be.false;
    });

    test('getOr', () => {
      const person = {
        name: 'matt'
      };
      getOr('name', 'default', person).should.equal('matt');
      getOr('age', 0, person).should.equal(0);
    });

    test('hasPath', () => {
      const deepPerson = {
        deeper: {
          name: 'matt'
        }
      };

      hasPath(['deeper'], deepPerson).should.be.true;
      hasPath(['deeper', 'name'], deepPerson).should.be.true;
      hasPath(["doesn't exist"], deepPerson).should.be.false;
      hasPath(['deeper', 'name'], undefined).should.be.false;
    });

    test('ifFalse', () => {
      ifFalse(() => true, false).should.be.true;
      ifFalse(() => 'n/a', true).should.be.true;
    });

    test('ifThenTransform', () => {
      const phil = { name: 'phil' }
        , matt = { name: 'matt' }
        ;

      const ifPhilThenCAPS = ifThenTransform(
        pipe([get('name'), strictEquals('phil')])
        , mSet('name', 'PHIL')
      );

      ifPhilThenCAPS(phil).should.deep.equal({ name: 'PHIL' });
      ifPhilThenCAPS(matt).should.deep.equal({ name: 'matt' });
    });

    test('invoke', () => {
      const person = {
        name: 'matt'
        , getName() { return this.name; }
      };
      invoke('getName', person).should.equal('matt');
      expect(invoke("doesn't exist", person)).to.be.undefined;
    });

    test('invokeAtPath', () => {
      const people = {
        matt: {
          name: 'matt'
          , getName() { return this.name; }
        }
      };
      invokeAtPath(['matt', 'getName'], people).should.equal('matt');
      expect(invokeAtPath(['phil', "doesn't exist"], people)).to.be.undefined;
    });

    test('invokeAtPathWith', () => {
      const people = {
        matt: {
          name: 'matt'
          , doChore(aChore) { return `I will do ${aChore} immediately sir!`; }
        }
      };
      invokeAtPathWith(['matt', 'doChore'], ['the dishes'], people)
        .should.equal('I will do the dishes immediately sir!');
      expect(
        invokeAtPathWith(['phil', "doesn't exist"], ['the dishes'], people)
      ).to.be.undefined;
    });

    test('invokeWith', () => {
      const person = {
        doChore(aChore) { return `I will do ${aChore} immediately sir!`; }
      };
      invokeWith('doChore', ['the dishes'], person).should.equal('I will do the dishes immediately sir!');
      expect(
        invokeWith("doesn't exist", ['the dishes'], person)
      ).to.be.undefined;
    });

    test('is', () => {
      is(Function, () => {}).should.be.true;
      is(String, '').should.be.true;
    });

    test('isDefined', () => {
      isDefined(undefined).should.be.false;
      isDefined('').should.be.true;
    });

    test('isEmpty', () => {
      isEmpty([]).should.be.true;
      isEmpty([1]).should.be.false;

      isEmpty('').should.be.true;
      isEmpty('1').should.be.false;

      isEmpty({}).should.be.true;
      isEmpty({ one: 1 }).should.be.false;

      isEmpty(new Map()).should.be.true;
      isEmpty(new Map([[ 'one', 1]])).should.be.false;

      isEmpty(new Set()).should.be.true;
      isEmpty(new Set([1])).should.be.false;

      isEmpty(undefined).should.be.true;
      isEmpty(null).should.be.true;
    });

    test('isUndefined', () => {
      isUndefined(undefined).should.be.true;
      isUndefined('').should.be.false;
    });

    test('isLaden', () => {
      isLaden([]).should.be.false;
      isLaden([1]).should.be.true;

      isLaden('').should.be.false;
      isLaden('1').should.be.true;

      isLaden({}).should.be.false;
      isLaden({ one: 1 }).should.be.true;

      isLaden(new Map()).should.be.false;
      isLaden(new Map([[ 'one', 1]])).should.be.true;

      isLaden(new Set()).should.be.false;
      isLaden(new Set([1])).should.be.true;

      isLaden(undefined).should.be.false;
      isLaden(null).should.be.false;
    });

    test('noop', () => {
      expect(noop()).to.be.undefined;
      expect(noop(1)).to.be.undefined;
    });

    test('not', () => {
      not(strictEquals(1), 1).should.be.false;
      not(strictEquals(1), 2).should.be.true;
    });

    test('pAllSettled', () => {
      const passFail = [Promise.resolve('pass'), Promise.reject('fail')];

      return pAllSettled(passFail)
        .should.become([
          {
            value: 'pass'
            , status: 'resolved'
          }, {
            value: 'fail'
            , status: 'rejected'
          }
        ]);
    });

    test('pCatch', () => {
      const p1 = passThrough(
        10
        , [
          delay
          , then(() => { throw new Error("whoa there"); })
        ]
      ).should.be.rejectedWith('whoa there');

      const p2 = passThrough(
        10
        , [
          delay
          , then(() => { throw new Error('whoa there'); })
          , pCatch(e => {
            e.should.be.an.error;
            e.message.should.equal('whoa there');
            return 'got there';
          })
        ]
      ).should.eventually.equal('got there');

      return Promise.all([p1, p2]);
    });

    test('pProps', () => {
      const resolveStringToNumber = {
        'one': Promise.resolve(1)
        , 'two': Promise.resolve('2')
      };

      return pProps(resolveStringToNumber)
        .should.become({ one: 1, two: '2' });
    });

    test('pPropsSettled', () => {
      const passFail = {
        pass: Promise.resolve('pass')
        , fail: Promise.reject('fail')
      };

      return pPropsSettled(passFail)
        .should.become({
          pass: {
            value: 'pass'
            , status: 'resolved'
          }
          , fail: {
            value: 'fail'
            , status: 'rejected'
          }
        });
    });

    test('pReflect', () => {
      const anError = 'an error'
        , success = 'success'
        ;

      return Promise.all([
          pReflect(Promise.resolve(success))
          , pReflect(Promise.reject(anError))
        ])
        .should.become([
          { status: 'resolved', value: 'success' }
          , { status: 'rejected', value: 'an error' }
        ]);
    });

    test('pReject', () => {
      const anError = 'an error';
      return pReject(anError)
        .catch(identity)
        .should.become(anError);
    });

    test('setAtPath', () => {
      setAtPath(['one', 'two'], 3, {}).should.deep.equal({ one: { two: 3} });
      setAtPath(['one', 'two'], 3, { one: {} }).should.deep.equal({ one: { two: 3} });
      expect(
        () => setAtPath(['one', 'two'], 3, { one: 1 })
      ).to.throw('setAtPath was given a path containing an unassignable key');
    });

    test('strictEquals', () => {
      strictEquals(1, 1).should.be.true;
      strictEquals(2, 1).should.be.false;
      strictEquals(NaN, NaN).should.be.false;
    });

    test('then', () => {
      return passThrough(
        10
        , [
          delay
          , then(alwaysReturn('got here'))
        ]
      ).should.eventually.equal('got here');
    });

    test('toBoolean', () => {
      toBoolean('').should.be.false;
      toBoolean('1').should.be.true;
    });
  });
});


//-------------//
// Helper Fxns //
//-------------//

function requireAll(arr) {
  return mMap(
    el => require('../lib/fxns/' + kebabCase(el))
    , arr
  );
}

function isOdd(num) {
  return num % 2;
}

function isEven(num) {
  return !(num % 2);
}

function createArgCollector() {
  let argsPerCall = [];
  return {
    cb: (...args) => { argsPerCall.push(cloneDeep(args)); }
    , extractArgsPerCall: () => {
      const res = argsPerCall;
      argsPerCall = [];
      return res;
    }
    , wrap: fn => (...args) => {
      argsPerCall.push(cloneDeep(args));
      return fn(...args);
    }
  };
}

function testReducer(reduceFn, getInitialRes) {
  const argCollector = createArgCollector()
    , englishToSpanishWrittenNumber = {
      one: 'uno'
      , three: 'tres'
    }
    , wrappedEnglishToSpanishWrittenNumber = argCollector.wrap(
      (res, curVal, curId) => {
        if (type(res) === 'Object') {
          return mSet(
            englishToSpanishWrittenNumber[curId] || curId
            , curVal
            , res
          );
        } else { // type(res) must equal 'Array'
          res.push(englishToSpanishWrittenNumber[curVal] || curVal);
          return res;
        }
      }
    );

  const theObject = { one: 1, dos: 2, three: 3 };
  reduceFn(
    wrappedEnglishToSpanishWrittenNumber
    , getInitialRes().obj
    , theObject
  ).should.deep.equal({ uno: 1, dos: 2, tres: 3 });

  argCollector.extractArgsPerCall().should.deep.equal([
    [{}, 1, 'one', theObject]
    , [{ uno: 1 }, 2, 'dos', theObject]
    , [{ uno: 1, dos: 2 }, 3, 'three', theObject]
  ]);


  const theMap = new Map([['one', 1], ['dos', 2], ['three', 3]]);
  reduceFn(
    wrappedEnglishToSpanishWrittenNumber
    , getInitialRes().obj
    , theMap
  ).should.deep.equal({ uno: 1, dos: 2, tres: 3 });

  deepEql(
    argCollector.extractArgsPerCall()
    , [
      [{}, 1, 'one', theMap]
      , [{ uno: 1 }, 2, 'dos', theMap]
      , [{ uno: 1, dos: 2 }, 3, 'three', theMap]
    ]
  ).should.be.true;


  const theArray = ['one', 'dos', 'three'];
  reduceFn(
    wrappedEnglishToSpanishWrittenNumber
    , getInitialRes().arr
    , theArray
  ).should.deep.equal(['uno', 'dos', 'tres']);

  argCollector.extractArgsPerCall().should.deep.equal([
    [[], 'one', 0, theArray]
    , [['uno'], 'dos', 1, theArray]
    , [['uno', 'dos'], 'three', 2, theArray]
  ]);


  const theSet = new Set(['one', 'dos', 'three']);
  reduceFn(
    wrappedEnglishToSpanishWrittenNumber
    , getInitialRes().arr
    , theSet
  ).should.deep.equal(['uno', 'dos', 'tres']);

  deepEql(
    argCollector.extractArgsPerCall()
    , [
      [[], 'one', 'one', theSet]
      , [['uno'], 'dos', 'dos', theSet]
      , [['uno', 'dos'], 'three', 'three', theSet]
    ]
  ).should.be.true;
}
