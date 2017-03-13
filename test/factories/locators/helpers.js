//---------//
// Imports //
//---------//

const arrayOfKeys = require('../../../lib/fxns/array-of-keys')
  , curry = require('lodash.curry')
  , deepEql = require('deep-eql')
  , discardWhen = require('../../../lib/fxns/discard-when')
  , pipe = require('../../../lib/fxns/pipe')
  ;

const { constructN1 } = require('../../../lib/fxns/utils')
  , { startsWith } = require('../../../lib/fxns/string')
  ;


//------//
// Init //
//------//

const locatorKeys = new Set(['name', 'locate']);


//------//
// Main //
//------//

const deepEquals = curry((a, b) => deepEql(a, b));

const isLocator = pipe([
  arrayOfKeys
  , constructN1(Set)

  // discard keys only exposed for testing purposes
  , discardWhen(startsWith('_'))

  , deepEquals(locatorKeys)
]);


//---------//
// Exports //
//---------//

module.exports = { deepEquals, isLocator };
