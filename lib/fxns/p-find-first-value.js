//---------//
// Imports //
//---------//

const getPFindFirst = require('./_get-p-find-first')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('pFindFirstValue', 2, getPFindFirst('value'));
