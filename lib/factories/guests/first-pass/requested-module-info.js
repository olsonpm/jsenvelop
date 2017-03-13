//------//
// Init //
//------//

const id = 'requestedModuleInfo';


//------//
// Main //
//------//

const createRequestedModuleInfoGuest = () => {
  //
  // require holds objects with the structure:
  // {
  //   requestString: <the request string>
  //   , isTopLevel: <true | false>
  // }
  //
  const requestedModuleInfo = {
      imports: new Set([])
      , requires: []
    }
    ;

  return {
    id
    , getResult: () => requestedModuleInfo
    , visitor: getVisitor()
  };

  // scoped helper fxns

  function getVisitor() {
    return {
      ImportDeclaration({ node }) {
        const requestString = node.source.value;
        requestedModuleInfo.imports.add(requestString);
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
            + " `require('some' + 'thing')` and `require(someVar + 'literal')`"
            + " are not."
            + "\n  argument (ast) type provided: " + node.arguments[0].type
          );
        }

        // woo woo - we have a valid require statement.  Push the
        //   request string.

        requestedModuleInfo.requires.push({
          isTopLevel: path.scope.parent === undefined
          , requestString: node.arguments[0].value
        });
      }
    };
  }
};



//---------//
// Exports //
//---------//

module.exports = createRequestedModuleInfoGuest;
