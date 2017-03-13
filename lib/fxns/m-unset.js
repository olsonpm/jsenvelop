const curry = require('lodash.curry');

module.exports = curry((key, obj) => { delete obj[key]; return obj; });
