//------//
// Init //
//------//

const id = 'isEsModule';


//------//
// Main //
//------//

const createIsEsModuleGuest = () => {
  let isEsModule = false;

  return {
    id
    , getResult: () => isEsModule
    , visitor: getVisitor()
  };

  // scoped helper fxns

  function getVisitor() {
    return {
      ImportDeclaration() {
        isEsModule = true;
      }
      , ExportDeclaration() {
        isEsModule = true;
      }
    };
  }
};



//---------//
// Exports //
//---------//

module.exports = createIsEsModuleGuest;
