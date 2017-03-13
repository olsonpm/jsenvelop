//
// README
// - A module has the following structure:
// {
//   ast: string
//   , code: string
//   , id: string
//   , dependedBy: Set of modules
//
//   ** the following properties are added once the module is parsed
//   , isEsModule: boolean
//   , ?requires: Set of modules
//   , ?imports: Set of modules
// }
//

//---------//
// Imports //
//---------//

const arrayOfKeys = require('../fxns/array-of-keys')
  , discard = require('../fxns/discard')
  , each = require('../fxns/each')
  , getFrom = require('../fxns/get-from')
  , isType = require('../fxns/is-type')
  , join = require('../fxns/join')
  , keepWhen = require('../fxns/keep-when')
  ;

const { isDefined, isEmpty, jstring } = require('../fxns/utils')
  , { truncateMultilineString } = require('../generic-utils')
  ;


//------//
// Init //
//------//

const allowedCreateModuleKeys = new Set(['ast', 'id', 'code'])
  , requiredCreateModuleKeys = new Set(['id', 'code'])
  ;


//------//
// Main //
//------//

const moduleService = {
  createModule
  , createModuleContainer
};


//-------------//
// Helper Fxns //
//-------------//

function createModule({ ast, id, code }) {
  validateCreateModule.apply(null, arguments);

  // no errors - woo woo
  return keepWhen(isDefined, {
    ast
    , code
    , id
    , dependedBy: new Set()
  });
}

function createModuleContainer() {
  const modules = {}
    , moduleContainer = getModuleContainer()
    ;

  return moduleContainer;

  function getModuleContainer() {
    return {
      addOne
      , removeOne
      , addMany
      , removeMany
      , getOne: getFrom(modules)
      , getAll: () => modules
    };
  }

  function removeOne(id) {
    delete modules[id];
    return moduleContainer;
  }

  function removeMany(idCollection) {
    each(removeOne, idCollection);
    return moduleContainer;
  }

  function addOne(data) {
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

    return moduleContainer;
  }

  function addMany(moduleCollection) {
    each(addOne, moduleCollection);
    return moduleContainer;
  }
}

function validateCreateModule({ id, code }) {
  if (arguments.length !== 1) {
    throw new Error(
      "create requires exactly one argument"
      + "\n  arguments given: " + truncateMultilineString(JSON.stringify(arguments, null, 2))
    );
  }

  const errMsgs = []
    , argKeys = arrayOfKeys(arguments[0])
    , missingKeys = discard(argKeys, requiredCreateModuleKeys)
    ;

  if (missingKeys.size) {
    errMsgs.push(
      "The following keys are missing from your Module constructor argument: "
      + join(', ', missingKeys)
    );
  }

  const invalidKeys = discard(allowedCreateModuleKeys, argKeys);
  if (invalidKeys.size) {
    errMsgs.push(
      "The following keys are invalid for the Module constructor: "
      + join(', ', invalidKeys)
    );
  }

  if (errMsgs.length) {
    errMsgs.push("arg provided: " + truncateMultilineString(JSON.stringify(arguments[0], null, 2)));
    throw new Error(join('\n\n', errMsgs));
  }

  if (isEmpty(id) || !isType('String', id)) {
    errMsgs.push("id must pass isLaden() and isType('String')");
  }

  if (!isType('String', code)) {
    errMsgs.push("code must pass isType('String')");
  }

  if (errMsgs.length) {
    errMsgs.push("arg provided: " + JSON.stringify(arguments[0], null, 2));
    throw new Error(join('\n\n', errMsgs));
  }
}


//---------//
// Exports //
//---------//

module.exports = moduleService;
