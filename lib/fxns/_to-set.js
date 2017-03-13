const isType = require('./is-type');

module.exports = arrOrSet => (isType('Set', arrOrSet))
  ? arrOrSet
  : new Set(arrOrSet);
