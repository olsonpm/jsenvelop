'use strict';


//---------//
// Imports //
//---------//

const babylon = require('babylon');


//------//
// Main //
//------//

const parseCodeToAst = code => babylon.parse(code, { sourceType: 'module' });


//---------//
// Exports //
//---------//

module.exports = { parseCodeToAst };
