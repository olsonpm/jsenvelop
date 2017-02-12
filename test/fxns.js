'use strict';


//---------//
// Imports //
//---------//

const bPromise = require('bluebird')
  , chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , cloneDeep = require('lodash.clonedeep')
  , curry = require('lodash.curry')
  , deepEql = require('deep-eql') // necessary until chai v4 releases
  , mMap = require('../lib/fxns/m-map')
  ;

const [
    all, any, containedIn, contains, curryN, discardWhen, discard
    , dropRightWhile, dropWhile, each, filter, findFirst, findFirstKeyValPair
    , flatten, getElementAt, hasElementAt, head, initial, join, last, map
    , mMapAccum, mMerge, omitWhen, omit, pipe, reduceFirst, reduceFresh, reduce
    , reject, separate, tail, take, typeCaller, type, unique, utils
  ] = requireAll([
    'all', 'any', 'contained-in', 'contains', 'curry-n', 'discard-when'
    , 'discard', 'drop-right-while', 'drop-while', 'each', 'filter'
    , 'find-first', 'find-first-key-val-pair', 'flatten', 'get-element-at'
    , 'has-element-at', 'head', 'initial', 'join', 'last', 'map', 'm-map-accum'
    , 'm-merge', 'omit-when', 'omit', 'pipe', 'reduce-first', 'reduce-fresh'
    , 'reduce', 'reject', 'separate', 'tail', 'take', 'type-caller', 'type'
    , 'unique', 'utils'
  ]);

const {
  adhere, adhereEach, adhereOwnEnumerable, alwaysReturn, apply, eachOffset, flip
  , get, getAtPath, getEq, getFirst, getFrom, hasKey, hasPath, ifFalse
  , ifThenTransform, invoke, invokeWith, is, isDefined, isEmpty, isLaden, isType
  , isUndefined, keys, mSet, noop, not, pCatch, ph, setAtPath, size
  , strictEquals, then, toBoolean, values
} = utils;

const {
  concat, mAppend, mAppendTo, mPrepend, mPrependTo
} = require('../lib/fxns/array');

const {
  allCharsEq, append, endsWith, prepend, startsWith, trim, trimEnd, trimStart
} = require('../lib/fxns/string');

const {
  hasNoCase, isLowercase, isUppercase
} = require('../lib/fxns/character');

const { findFirstValueIn } = require('../lib/fxns/set');


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();
const expect = chai.expect;


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
      const discardOddNumbers = discardWhen(isOdd);

      discardOddNumbers({ one: 1, two: 2, three: 3 }).should.deep.equal({ two: 2 });
      discardOddNumbers([1, 2, 3]).should.deep.equal([2]);

      deepEql(
        discardOddNumbers(new Map([['one', 1], ['two', 2], ['three', 3]]))
        , new Map([['two', 2]])
      ).should.be.true;

      deepEql(
        discardOddNumbers(new Set([1, 2, 3]))
        , new Set([2])
      ).should.be.true;
    });

    test('dropRightWhile', () => {
      dropRightWhile(isOdd, [2, 1, 3]).should.deep.equal([2]);
      dropRightWhile(isUppercase, 'aaaAAA').should.equal('aaa');
    });

    test('dropWhile', () => {
      dropWhile(isOdd, [1, 3, 2]).should.deep.equal([2]);
      dropWhile(isLowercase, 'aaaAAA').should.equal('AAA');
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

    test('filter', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      filter(wrappedIsOdd, theObject).should.deep.equal({ one: 1, three: 3 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
        , [3, 'three', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);

      deepEql(
        filter(wrappedIsOdd, theMap)
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
      filter(wrappedIsOdd, theArray).should.deep.equal([1, 3]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
        , [2, 1, theArray]
        , [3, 2, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      deepEql(
        filter(wrappedIsOdd, theSet)
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

    test('findFirst', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      findFirst(wrappedIsOdd, theObject).should.equal(1);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      findFirst(wrappedIsOdd, theMap).should.equal(1);

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
        ]
      ).should.be.true;


      const theArray = [1, 2, 3];
      findFirst(wrappedIsOdd, theArray).should.equal(1);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      findFirst(wrappedIsOdd, theSet).should.equal(1);

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 1, theSet]
        ]
      ).should.be.true;
    });

    test('findFirstKeyValPair', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      findFirstKeyValPair(wrappedIsOdd, theObject).should.deep.equal(['one', 1]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      findFirstKeyValPair(wrappedIsOdd, theMap).should.deep.equal(['one', 1]);

      deepEql(
        argCollector.extractArgsPerCall()
        , [
          [1, 'one', theMap]
        ]
      ).should.be.true;


      const theArray = [1, 2, 3];
      findFirstKeyValPair(wrappedIsOdd, theArray).should.deep.equal([0, 1]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
      ]);
    });

    test('flatten', () => {
      flatten([1, 2, 3]).should.deep.equal([1, 2, 3]);
      flatten([1, [2], 3]).should.deep.equal([1, 2, 3]);
      flatten([1, [[2]], 3]).should.deep.equal([1, [2], 3]);
    });

    test('getElementAt', () => {
      getElementAt('one', new Map([['one', 1]])).should.equal(1);
      getElementAt(0, [0]).should.equal(0);
      expect(
        () => getElementAt('zero', [0])
      ).to.throw('getElementAt for an array requires idx to parse as an integer');
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

    test('join', () => {
      join(', ', [1, 2, 3]).should.equal('1, 2, 3');
      join(', ', new Set([1, 2, 3])).should.equal('1, 2, 3');
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

    test('m-map', () => {
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

    test('pipe', () => {
      const identity = x => x
        , puppyToKitty = str => (str === 'puppy')
          ? 'kitty'
          : str
        ;

      pipe([identity], 'puppy').should.equal('puppy');
      pipe([identity], 'puppy', 'kitty').should.equal('puppy');
      pipe([
        str => {
          str.should.equal('puppy');
          return str;
        }
        , puppyToKitty
        ]
        , 'puppy'
      ).should.equal('kitty');
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

    test('reject', () => {
      const argCollector = createArgCollector()
        , wrappedIsOdd = argCollector.wrap(isOdd);

      const theObject = { one: 1, two: 2, three: 3 };
      reject(wrappedIsOdd, theObject).should.deep.equal({ two: 2 });

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 'one', theObject]
        , [2, 'two', theObject]
        , [3, 'three', theObject]
      ]);


      const theMap = new Map([['one', 1], ['two', 2], ['three', 3]]);
      deepEql(
        reject(wrappedIsOdd, theMap)
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
      reject(wrappedIsOdd, theArray).should.deep.equal([2]);

      argCollector.extractArgsPerCall().should.deep.equal([
        [1, 0, theArray]
        , [2, 1, theArray]
        , [3, 2, theArray]
      ]);


      const theSet = new Set([1, 2, 3]);
      deepEql(
        reject(wrappedIsOdd, theSet)
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

    test('separate', () => {
      separate('/', '/ab/c/').should.deep.equal(['ab', 'c']);
      separate('/', 'ab/c').should.deep.equal(['ab', 'c']);

      separate(null, [null, 1, 2, null, 3, null]).should.deep.equal([[1, 2], [3]]);
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

    test('typeCaller', () => {
      const getCollectionTypeMapper = () => ({
        Object: alwaysReturn('an object')
        , Array: alwaysReturn('an array')
      });

      const anObjectOrArray = typeCaller(1, getCollectionTypeMapper);

      anObjectOrArray({}).should.equal('an object');
      anObjectOrArray([]).should.equal('an array');
      expect(() => anObjectOrArray('')).to.throw(/^invalid type passed/);
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

    test('mAppend', () => {
      const arrOf1 = [1];
      mAppend(2, arrOf1);
      arrOf1.should.deep.equal([1, 2]);
    });

    test('mAppendTo', () => {
      const arrOf1 = [1];
      mAppendTo(arrOf1, 2);
      arrOf1.should.deep.equal([1, 2]);
    });

    test('mPrepend', () => {
      const arrOf2 = [2];
      mPrepend(1, arrOf2);
      arrOf2.should.deep.equal([1, 2]);
    });

    test('mPrependTo', () => {
      const arrOf2 = [2];
      mPrependTo(arrOf2, 1);
      arrOf2.should.deep.equal([1, 2]);
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

    test('prepend', () => {
      prepend('a', 'b').should.equal('ab');
    });

    test('startsWith', () => {
      startsWith('a', 'ab').should.be.true;
      startsWith('ab', 'ab').should.be.true;
      startsWith('ab', 'cba').should.be.false;
      expect(() => startsWith('', 'abc')).to.throw(/^startsWith requires a 'mightStartWithThis' string of length >= 1/);
    });

    test('trim', () => {
      trim('a', 'bab').should.equal('bab');
      trim('a', 'aba').should.equal('b');
      trim('a', 'aaa').should.equal('');
      expect(() => trim('', 'aaa')).to.throw(/^trim requires the first argument to be a single character/);
    });

    test('trimEnd', () => {
      trimEnd('a', 'bab').should.equal('bab');
      trimEnd('a', 'aba').should.equal('ab');
      trimEnd('a', 'aaa').should.equal('');
      expect(() => trimEnd('', 'aaa')).to.throw(/^trimEnd requires the first argument to be a single character/);
    });

    test('trimStart', () => {
      trimStart('a', 'bab').should.equal('bab');
      trimStart('a', 'aba').should.equal('ba');
      trimStart('a', 'aaa').should.equal('');
      expect(() => trimStart('', 'aaa')).to.throw(/^trimStart requires the first argument to be a single character/);
    });
  });

  suite('set', () => {
    test('findFirstValueIn', () => {
      findFirstValueIn(
        new Set([1, 2])
        , new Set([2, 1])
      ).should.equal(2);

      findFirstValueIn(
        new Set([1, 2])
        , new Set([3, 2])
      ).should.equal(2);

      expect(
        findFirstValueIn(
          new Set([1, 2])
          , new Set([4, 3])
        )
      ).to.be.undefined;
    });
  });

  suite('utils', () => {
    test('adhere', () => {
      const person = {
        name: 'phil'
        , getName() { return this.name; }
      };
      const getName = adhere('getName', person);
      getName().should.equal('phil');
    });

    test('adhereEach', () => {
      const person = {
        name: 'phil'
        , getName() { return this.name; }
        , screamName() { return this.name + '!'; }
      };

      const { getName, screamName } = adhereEach(['getName', 'screamName'], person);
      getName().should.equal('phil');
      screamName().should.equal('phil!');
    });

    test('adhereOwnEnumerable', () => {
      const person = {
        name: 'phil'
        , getName() { return this.name; }
        , screamName() { return this.name + '!'; }
      };

      const adheredPerson = adhereOwnEnumerable(person);

      deepEql(
        keys(adheredPerson)
        , new Set(['getName', 'screamName'])
      ).should.be.true;
      adheredPerson.getName().should.equal('phil');
      adheredPerson.screamName().should.equal('phil!');
    });

    test('alwaysReturn', () => {
      const obj = {};
      expect(alwaysReturn()()).to.be.undefined;
      alwaysReturn(1)().should.equal(1);
      alwaysReturn(obj)().should.equal(obj);
    });

    test('apply', () => {
      const add = curry((a, b) => a + b);
      apply([1, 2], add).should.equal(3);
      apply([1], add)(2).should.equal(3);
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

    test('flip', () => {
      const myConcat = (left, right) => left.concat(right)
        , myPrepend = flip(myConcat);

      myPrepend([1], [2]).should.deep.equal([2, 1]);
    });

    test('get', () => {
      const person = {
        name: 'phil'
      };
      get('name', person).should.equal('phil');
      expect(get("doesn't exist", person)).to.be.undefined;
      expect(get('name', undefined)).to.be.undefined;
    });

    test('getAtPath', () => {
      const deepPerson = {
        deeper: {
          name: 'phil'
        }
      };

      getAtPath(['deeper'], deepPerson).should.deep.equal({ name: 'phil' });
      getAtPath(['deeper', 'name'], deepPerson).should.equal('phil');
      expect(getAtPath(["doesn't exist"], deepPerson)).to.be.undefined;
      expect(getAtPath(['deeper', 'name'], undefined)).to.be.undefined;
    });

    test('getEq', () => {
      const person = {
        name: 'phil'
      };
      getEq('name', 'phil', person).should.be.true;
      expect(getEq("doesn't exist", 'anything could be here', person)).to.be.undefined;
      getEq('name', 'not phil', person).should.be.false;
    });

    test('getFirst', () => {
      const car = {
        name: 'bessy'
        , make: 'toyota'
      };
      getFirst(['name', 'make'], car).should.equal('bessy');
      getFirst(['make', 'name'], car).should.equal('toyota');
      getFirst(["doesn't exist", 'name'], car).should.equal('bessy');
      expect(getFirst(["doesn't exist"], car)).to.be.undefined;
    });

    test('getFrom', () => {
      const person = {
        name: 'phil'
      };
      getFrom(person, 'name').should.equal('phil');
      expect(getFrom(undefined, 'name')).to.be.undefined;
      expect(getFrom(person, "doesn't exist")).to.be.undefined;
    });

    test('hasKey', () => {
      const person = {
        name: 'phil'
      };
      hasKey('name', person).should.be.true;
      hasKey("doesn't exist", person).should.be.false;

      // doesn't have to be enumerable
      hasKey('toString', true).should.be.true;
      hasKey("doesn't exist", true).should.be.false;
    });

    test('hasPath', () => {
      const deepPerson = {
        deeper: {
          name: 'phil'
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
        name: 'phil'
        , getName() { return this.name; }
      };
      invoke('getName', person).should.equal('phil');
      expect(invoke("doesn't exist", person)).to.be.undefined;
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

    test('isType', () => {
      isType('String', '1').should.be.true;
      isType('String', 1).should.be.false;
      isType('Number', 1).should.be.true;
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

    test('keys', () => {
      deepEql(
        keys({ one: 1 })
        , new Set(['one'])
      ).should.be.true;

      deepEql(
        keys(new Map([['one', 1]]))
        , new Set(['one'])
      ).should.be.true;

      expect(() => keys([1])).to.throw(/^invalid type passed/);
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

    test('noop', () => {
      expect(noop()).to.be.undefined;
      expect(noop(1)).to.be.undefined;
    });

    test('not', () => {
      not(strictEquals(1), 1).should.be.false;
      not(strictEquals(1), 2).should.be.true;
    });

    test('pCatch', () => {
      const p1 = pipe(
        [
          delay
          , then(() => { throw new Error("whoa there"); })
        ]
        , 10
      ).should.be.rejectedWith('whoa there');

      const p2 = pipe(
        [
          delay
          , then(() => { throw new Error('whoa there'); })
          , pCatch(e => {
            e.should.be.an.error;
            e.message.should.equal('whoa there');
            return 'got there';
          })
        ]
        , 10
      ).should.eventually.equal('got there');

      return Promise.all([p1, p2]);
    });

    test('ph', () => {
      const subtract = curry(
          (left, right) => left - right
        )
        , subtract2from = subtract(ph, 2);

      subtract2from(3).should.equal(1);
    });

    test('setAtPath', () => {
      setAtPath(['one', 'two'], 3, {}).should.deep.equal({ one: { two: 3} });
      setAtPath(['one', 'two'], 3, { one: {} }).should.deep.equal({ one: { two: 3} });
      expect(
        () => setAtPath(['one', 'two'], 3, { one: 1 })
      ).to.throw('setAtPath was given a path containing an unassignable key');
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

    test('strictEquals', () => {
      strictEquals(1, 1).should.be.true;
      strictEquals(2, 1).should.be.false;
      strictEquals(NaN, NaN).should.be.false;
    });

    test('then', () => {
      return pipe(
        [
          delay
          , then(alwaysReturn('got here'))
        ]
        , 10
      ).should.eventually.equal('got here');
    });

    test('toBoolean', () => {
      toBoolean('').should.be.false;
      toBoolean('1').should.be.true;
    });

    test('values', () => {
      values({ one: 1, two: 2 }).should.deep.equal([1, 2]);
      values(new Map([['one', 1], ['two', 2]])).should.deep.equal([1, 2]);
    });
  });
});


//-------------//
// Helper Fxns //
//-------------//

function requireAll(arr) {
  return mMap(
    el => require('../lib/fxns/' + el)
    , arr
  );
}

function delay(ms) {
  return bPromise.delay(ms);
}

function isOdd(num) {
  return num % 2;
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
