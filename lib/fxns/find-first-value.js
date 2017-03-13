//---------//
// Imports //
//---------//

const getFindFirst = require('./_get-find-first')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('findFirstValue', 2, getFindFirst('value'));
