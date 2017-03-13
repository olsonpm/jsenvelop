//---------//
// Imports //
//---------//

const getPFindFirst = require('./_get-p-find-first')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('pFindFirstResult', 2, getPFindFirst('result'));
