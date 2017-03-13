const curry = require('lodash.curry');

module.exports = curry((fn, ...args) => !fn(...args), 2);
