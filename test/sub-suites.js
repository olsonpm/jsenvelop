'use strict';


//---------//
// Imports //
//---------//

const pify = require('pify');

const each = require('../lib/fxns/each')
  , path = require('path')
  , pFs = pify(require('fs'))
  ;


//------//
// Main //
//------//

pFs.readdir(path.join(__dirname, 'models'))
  .then(fileNameArr => {
    suite('models', () => {
      each(
        aFileName => require('./models/' + aFileName)
        , fileNameArr
      );
    });
  })
  .catch(e => { console.error(e); })
  ;
