'use strict';


//---------//
// Imports //
//---------//

const createServerFsLocator = require('./lib/factories/locators/server-fs')
  , createNodeLocator = require('./lib/factories/locators/node')
  , createJsenvelop = require('./lib/factories/jsenvelop')
  ;


//---------//
// Exports //
//---------//

module.exports = createJsenvelop({
  locators: [createNodeLocator(), createServerFsLocator()]
});
