//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , get = require('./fxns/get')
  , map = require('./fxns/map')
  , mMerge = require('./fxns/m-merge')
  , passThrough = require('./fxns/pass-through')
  , reduce = require('./fxns/reduce')
  , run = require('./fxns/run')
  , traverse = require('babel-traverse').default
  ;

const { curriedTraverse } = require('./domain-utils');


//------//
// Init //
//------//

const mergeVisitors = traverse.visitors.merge;


//------//
// Main //
//------//

const travel = curry((guestFactoryArr, ast) => {
  const guestArr = map(run, guestFactoryArr);

  passThrough(guestArr, [
    map(get('visitor'))
    , mergeVisitors
    , curriedTraverse(ast)
  ]);

  return reduce(toGuestResults, {}, guestArr);
});


//-------------//
// Helper Fxns //
//-------------//

function toGuestResults(results, { id, getResult }) {
  return mMerge(results, { [id]: getResult() });
}


//---------//
// Exports //
//---------//

module.exports = travel;
