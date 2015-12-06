
/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;

var test = require('./env/test');
var production = require('./env/production');
var development = null;
try {
  fs.statSync('config/env/development.js');
  development = require('./env/development');
}
catch (e) {}

var defaults = {
  root: path.normalize(__dirname + '/..')
};

/**
 * Expose
 */

module.exports = {
  development: extend(development, defaults) || null,
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || "production"];
