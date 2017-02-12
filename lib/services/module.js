'use strict';


//---------//
// Imports //
//---------//

const each = require('../fxns/each')
  , mMerge = require('../fxns/m-merge')
  , pipe = require('../fxns/pipe')
  ;

const { alwaysReturn, jstring } = require('../fxns/utils');


//------//
// Init //
//------//

const modules = {}
  , addModule = getAddModule()
  , removeModule = id => { delete modules[id]; return moduleService; }
  ;


//------//
// Main //
//------//

const moduleService = {};

mMerge(
  moduleService
  , {
    addModule
    , removeModule
    , addManyModules: pipe([
      each((data, id) => addModule(id, data))
      , alwaysReturn(moduleService)
    ])
    , getModules: () => modules
    , removeManyModules: pipe([
      each(removeModule)
      , alwaysReturn(moduleService)
    ])
  }
);


//-------------//
// Helper Fxns //
//-------------//

function getAddModule() {
  return data => {
    const { id } = data;

    if (modules[id]) {
      throw new Error(
        "unable to add module - module id already exists"
        + "\n  id given: " + id
        + "\n  module data given: " + jstring(data)
        + "\n  existing module data: " + jstring(modules[id])
      );
    }

    // no errors - we good like ali

    modules[id] = data;

    return moduleService;
  };
}


//---------//
// Exports //
//---------//

module.exports = moduleService;
