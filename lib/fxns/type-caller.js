//---------//
// Imports //
//---------//

const curryN = require('./curry-n')
  , type = require('./type')
  ;


//------//
// Init //
//------//

// avoid circular references by copy/pasting
const last = arr => arr[arr.length - 1];


//------//
// Main //
//------//

module.exports = (fnName, numArgs, getCollectionTypeMapper) =>
  curryN(
    numArgs
    , (...args) => {
      const collectionTypeMapper = getCollectionTypeMapper()
        , typePassed = type(last(args.slice(0, numArgs)))
        ;

      let fn = collectionTypeMapper[typePassed];

      if (!fn) {
        if (
          typePassed !== 'Object'
          && shouldFallBackToObject(typePassed)
          && collectionTypeMapper.Object
        ) {
          fn = collectionTypeMapper.Object;
        } else {
          throw new Error(
            `invalid type passed to function '${fnName}'`
            + "\n  last arg type: " + type(last(args.slice(0, numArgs)))
            + "\n  types allowed: " + Object.keys(collectionTypeMapper).join(', ')
          );
        }
      }

      return fn(...args);
    }
  );


//-------------//
// Helper Fxns //
//-------------//

const nullOrUndefinedTypes = new Set([type(null), type(undefined)]);
function shouldFallBackToObject(aType) {
  return !nullOrUndefinedTypes.has(aType);
}
