//
// README
// - This file takes an entry module then parses it recursively (meaning parses
//   each containing module as noted by 'import' or 'require').  It outputs
//   a module container with data necessary for scope hoisting.  This means each
//   module AST will be traversed twice, which is necessary in order to hoist
//   modules fetched via 'require'.  'require'd modules can only be hoisted if
//   they are only referenced in the same scope.  If they are require'd in
//   different scopes, then they must be wrapped separately and called via a
//   function in each place (similar to how webpack and browserify currently
//   handle modules).
//


//---------//
// Imports //
//---------//

const mMap = require('./fxns/m-map')
  , mMerge = require('./fxns/m-merge')
  , passThrough = require('./fxns/pass-through')
  , pipe = require('./fxns/pipe')
  , transform = require('./fxns/transform')
  , travel = require('./travel')
  ;

const { parseCodeToAst } = require('./domain-utils')
  , { alwaysReturn, get, pAll, pCatch, then } = require('./fxns/utils')
  , { mAppendTo } = require('./fxns/array')
  , { createModule, createModuleContainer } = require('./services/module')
  ;

const guestsPath = './factories/guests/first-pass'
  , guestFactoryArr = [
    require(guestsPath + '/is-es-module')
    , require(guestsPath + '/requested-module-info')
  ]
  ;


//------//
// Main //
//------//

function parseEntryModule(aModule, { resolve }) {
  const errors = []
    , aModuleContainer = createModuleContainer().addOne(aModule)
    ;

  return recursivelyParseModule(aModule)
    .then(() => {
      if (!errors.length) return aModuleContainer;

      const err = new Error(
        "Error while recursively parsing the modules"
        + "\n  entry module: " + aModule.id
      );
      err.errors = errors;
      return Promise.reject(err);
    })
    ;


  // scoped helper fxns

  function recursivelyParseModule(aModule) {
    const { isEsModule, requestedModuleInfo } = travel(guestFactoryArr, aModule.ast);
    mMerge(aModule, { isEsModule });

    return passThrough(requestedModuleInfo, [
      mMap(mMerge({ dependentModuleId: aModule.id }))
      , mMap(toRecursivelyParseModule)
      , pAll
    ]);
  }

  function toRecursivelyParseModule({ dependentModuleId, isTopLevel
    , requestString, requestedVia }) {

    const locateArg = { dependentModuleId, requestString, requestedVia };

    return passThrough(
      locateArg
      , [
        resolve
        , then(locateResult => {
          let dependedModule = aModuleContainer.getOne(locateResult.id);

          const shouldCreateModule = !dependedModule
            , didCreateModule = shouldCreateModule
            ;

          if (shouldCreateModule) {
            dependedModule = createModule(locateResult);

            passThrough(dependedModule, [
              mMerge({
                requestedVia
                , ast: parseCodeToAst(dependedModule.code)
              })
              , aModuleContainer.addOne
            ]);
          } else { // validate
            dependedModule.requestedVia = (dependedModule.requestedVia === 'import')
              ? 'import'
              : requestedVia;

            dependedModule.isTopLevel =  dependedModule.isTopLevel && isTopLevel;
          }

          aModule.dependsOn.add(dependedModule);
          dependedModule.dependedBy.add(aModule);

          if (didCreateModule) {
            return recursivelyParseModule(dependedModule);
          }
        })
        , pCatch(pipe([
          mAppendTo(errors)
          , alwaysReturn(undefined)
        ]))
      ]
    );
  }
}


//---------//
// Exports //
//---------//

module.exports = parseEntryModule;
