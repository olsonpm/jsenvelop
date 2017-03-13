//---------//
// Imports //
//---------//

const reduce = require('./reduce')
  , tail = require('./tail')
  ;


//------//
// Main //
//------//

module.exports = fnArr => (...args) => {
  if (!fnArr.length) return args[0];
  const res = fnArr[0](...args);

  if (fnArr.length === 1) return res;

  return reduce(
    (innerArg, fn) => fn(innerArg)
    , res
    , tail(fnArr)
  );
};
