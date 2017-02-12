'use strict';


//---------//
// Imports //
//---------//

const getNodeFsResolver = require('./lib/resolvers/node-fs')
  , getJsenvelop = require('./lib/get-jsenvelop')
  ;


//---------//
// Exports //
//---------//

module.exports = getJsenvelop({ fsResolver: getNodeFsResolver() });
