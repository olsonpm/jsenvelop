'use strict';


//---------//
// Imports //
//---------//

const discard = require('../fxns/discard')
  , join = require('../fxns/join')
  , mMerge = require('../fxns/m-merge')
  , pipe = require('../fxns/pipe')
  , separate = require('../fxns/separate')
  , take = require('../fxns/take')
  ;

const { isEmpty, keys, isType } = require('../fxns/utils')
  , { mAppend } = require('../fxns/array')
  ;


//------//
// Init //
//------//

const constructorKeys = new Set(['ast', 'id', 'code'])
  , requiredConstructorKeys = new Set(['id', 'code'])
  ;


//------//
// Main //
//------//

class Module {
  constructor({ ast, id, code }) {
    validateConstructorArg.apply(null, arguments);

    // no errors - woo woo
    mMerge(this, { ast, id, code, dependsOn: [] });
  }
}


//-------------//
// Helper Fxns //
//-------------//

function validateConstructorArg({ id, code }) {
  if (arguments.length !== 1) {
    throw new Error(
      "The Module constructor requires exactly one argument"
      + "\n  arguments given: " + truncateMultilineString(JSON.stringify(arguments, null, 2))
    );
  }
  const errMsgs = []
    , argKeys = keys(arguments[0])
    , missingKeys = discard(argKeys, requiredConstructorKeys);

  if (missingKeys.size) {
    errMsgs.push(
      "The following keys are missing from your Module constructor argument: "
      + join(', ', missingKeys)
    );
  }

  const invalidKeys = discard(constructorKeys, argKeys);
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

function truncateMultilineString(str) {
  return pipe(
    [
      separate('\n')
      , take(9)
      , mAppend('  ...')
      , join('\n')
    ]
    , str
  );
}


//---------//
// Exports //
//---------//

module.exports = Module;
