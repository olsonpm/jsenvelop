'use strict';


//---------//
// Imports //
//---------//

const getBrowserFsResolver = require('./lib/resolvers/browser-fs')
  , getJsenvelop = require('./lib/get-jsenvelop')
  , MemFs = require('./lib/models/mem-fs')
  ;


//------//
// Main //
//------//

const browserFsResolver = getBrowserFsResolver({ memFsInst: new MemFs() });


//---------//
// Exports //
//---------//

module.exports = getJsenvelop({ fsResolver: browserFsResolver });
