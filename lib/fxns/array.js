'use strict';


//---------//
// Imports //
//---------//

const curry = require('lodash.curry');

const { flip } = require('./utils');


//------//
// Main //
//------//

const concat = curry((arrLeft, arrRight) => arrLeft.concat(arrRight))
  , mAppend = curry((el, arr) => { arr.push(el); return arr; })
  , mAppendTo = flip(mAppend)
  , mPrepend = curry((el, arr) => { arr.unshift(el); return arr; })
  , mPrependTo = flip(mPrepend)
  ;


//---------//
// Exports //
//---------//

module.exports = {
  concat, mAppend, mAppendTo, mPrepend, mPrependTo
};
