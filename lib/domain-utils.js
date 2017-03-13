//---------//
// Imports //
//---------//

const babylon = require('babylon')
  , curry = require('lodash.curry')
  , traverse = require('babel-traverse').default
  ;


//------//
// Main //
//------//

const parseCodeToAst = code => babylon.parse(code, { sourceType: 'module' });

const curriedTraverse = curry((ast, visitors) => traverse(ast, visitors));


//---------//
// Exports //
//---------//

module.exports = { curriedTraverse, parseCodeToAst };
