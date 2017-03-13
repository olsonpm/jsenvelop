//---------//
// Imports //
//---------//

const getFindFirst = require('./_get-find-first')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('findFirstResult', 2, getFindFirst('result'));
