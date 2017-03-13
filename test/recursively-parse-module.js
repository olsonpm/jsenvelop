//---------//
// Imports //
//---------//

const chai = require('chai')
  , chaiAsPromised = require('chai-as-promised')
  , createResolver = require('../lib/factories/resolver')
  , createServerFsLocator = require('../lib/factories/locators/server-fs')
  , path = require('path')
  , recursivelyParseModule = require('../lib/recursively-parse-module')
  , sModule = require('../lib/services/module')
  ;

const { parseCodeToAst } = require('../lib/domain-utils')
  , { readFile } = require('../lib/generic-utils')
  ;


//------//
// Init //
//------//

chai.use(chaiAsPromised);
chai.should();

const serverFsLocator = createServerFsLocator();


//------//
// Main //
//------//

suite('recursivelyParseModules', () => {
  suite('simple', () => {
    const simpleDir = path.join(__dirname, './resources/recursively-parse-module/simple')
      , mainId = simpleDir + '/main.js'
      , fsResolver = createResolver({ locators: [serverFsLocator] })
      ;

    test('one require', () => {
      return readFile(mainId)
        .then(code => {
          const entryModule = sModule.createModule({
            code
            , ast: parseCodeToAst(code)
            , id: mainId
          });

          return recursivelyParseModule(entryModule, fsResolver);
        })
        .then(aModuleContainer => {
          console.log('modules: ' + JSON.stringify(aModuleContainer.getAll(), null, 2));
        })
        ;
    });
  });
  // test('the exported method', () => {
  //   const fname = '/home/phil/git-repos/personal/jsenvelop/playground/index.js';
  //   return readFile(fname)
  //     .then(code => recursivelyParseModules(sModule.create({
  //       id: fname
  //       , code: code
  //     })))
  //     .then(() => {
  //
  //     })
  //     .catch(errs => {
  //       console.error('errs: ' + errs);
  //     })
  //     ;
  // });
});
