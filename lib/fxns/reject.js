'use strict';


//---------//
// Imports //
//---------//

const _ = require('lodash')
  , filter = require('./filter')
  ;


//------//
// Init //
//------//

const not = _.curry((fn, ...args) => !fn(...args), 2);


//------//
// Main //
//------//

module.exports = _.curry(
  (fn, something) => filter(not(fn), something)
);
