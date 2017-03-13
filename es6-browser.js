//---------//
// Imports //
//---------//

const createBrowserFsLocator = require('./lib/factories/locators/browser-fs')
  , createJsenvelop = require('./lib/factories/jsenvelop')
  , sMemFs = require('./lib/services/mem-fs')
  ;


//------//
// Main //
//------//

const browserFs = createBrowserFsLocator({ memFsInst: sMemFs.create() })
  , jsenvelop = createJsenvelop({ locators: [browserFs] })
  ;


//---------//
// Exports //
//---------//

module.exports = jsenvelop;
