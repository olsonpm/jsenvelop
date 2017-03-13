const curry = require('lodash.curry');

module.exports = curry((key, val, obj) => { obj[key] = val; return obj; });
