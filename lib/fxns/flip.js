//---------//
// Imports //
//---------//

const curry = require('lodash.curry');


//------//
// Main //
//------//

module.exports = fn => curry((a, b) => fn(b, a));
