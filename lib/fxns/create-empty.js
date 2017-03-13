const getFrom = require('./get-from');

const strToConstructor = {
  Object: () => ({})
  , Array: () => []
  , Map: () => new Map()
  , Set: () => new Set()
};

module.exports = getFrom(strToConstructor);
