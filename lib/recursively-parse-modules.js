'use strict';


//---------//
// Imports //
//---------//

const map = require('./fxns/map')
  , pipe = require('./fxns/pipe')
  , traverse = require('babel-traverse').default
  , unique = require('./fxns/unique')
  ;

const { resolve }  = require('./services/resolve')
  , { addModule } = require('./services/module')
  , { parseCodeToAst } = require('./services/utils')
  , { pCatch, then } = require('./fxns/utils')
  , { pAll } = require('./utils')
  ;


//------//
// Main //
//------//

// expose this internal function for testing purposes.  If there's a better way
//   to accomplish this goal let me know!
parseEntryModule._getRequestStringsFromAst = getRequestStringsFromAst;

function parseEntryModule(aModule) {
  const errors = []
    , recursivelyParseModule = getRecursivelyParseModule(errors)
    ;

  // the best solution would be to expose a symbol on this module with the same
  //   information, but that's more work -.-
  errors.isArrayOfErrors = true;

  return recursivelyParseModule(aModule)
    .then(res => (errors.length) ? errors : res)
    ;
}


//-------------//
// Helper Fxns //
//-------------//

function getRecursivelyParseModule(errors) {
  return recursivelyParseModule;

  // both helper functions require a reference to errors.  the latter function
  //   needs a reference to recursivelyParseModule

  function recursivelyParseModule(aModule) {

    // The error handling is done this way due to the recursive nature of our
    //   module resolution.  We want to stop processing all modules as soon as
    //   an error occurs during any of them.  Throwing wouldn't do any good
    //   since all module resolution promises are branched.
    if (errors.length) return Promise.resolve();

    const resolveParamsToRecursivelyParseModule = getResolveParamsToRecursivelyParseModule(aModule);

    return pipe(
      [
        getRequestStringsFromAst
        , unique
        , map(requestString => ({ requestString, dependentModuleId: aModule.id }))
        , map(resolveParamsToRecursivelyParseModule)
        , pAll
      ]
      , aModule.ast
    );
  }

  function getResolveParamsToRecursivelyParseModule(aModule) {
    return pipe([
      resolve
      , then(dependedModule => {
        aModule.dependsOn.push(dependedModule.id);
        dependedModule.ast = parseCodeToAst(dependedModule.code);
        addModule(dependedModule);
        return recursivelyParseModule(dependedModule);
      })
      , pCatch(e => { errors.push(e); })
    ]);
  }
}

function getRequestStringsFromAst(ast) {
  const requestStrings = [];

  traverse(
    ast
    , {
      ImportDeclaration({ node }) {
        requestStrings.push(node.source.value);
      }

      , CallExpression(path) {
        const node = path.node;

        if (node.callee.loc.identifierName !== 'require')
          return;

        if (node.arguments.length !== 1) {
          throw new Error(
            "unexpected `require()` call - a single argument must be passed"
            + "\n  number of arguments: " + node.arguments.length
          );
        } else if (node.arguments[0].type !== 'StringLiteral') {
          throw new Error(
            "jsenvelop currently only supports require statements with a single"
            + " string literal"
            + "\n  e.g. `require('something')` is supported whereas"
            + " `require('some' + 'thing')` and `require(var + 'literal')`"
            + " are not."
            + "\n  argument (ast) type provided: " + node.arguments[0].type
          );
        }

        // woo woo - we have a valid require statement.  Push the
        //   request string.

        requestStrings.push(node.arguments[0].value);
      }
    }
  );

  return requestStrings;
}


//---------//
// Exports //
//---------//

module.exports = parseEntryModule;
