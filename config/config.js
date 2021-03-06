
/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var extend = require('util')._extend;

var test = require('./env/test');
var production = require('./env/production');
var development = null;
var dev = null;
try {
  fs.statSync('config/env/development.js');
  development = require('./env/development');
  dev = extend(development, defaults);
  console.log("development!");
}
catch (e) {}

var defaults = {
  root: path.normalize(__dirname + '/..')
};

/**
 * Expose
 */

module.exports = {
  development: dev,
  test: extend(test, defaults),
  production: extend(production, defaults)
}[process.env.NODE_ENV || "development"];
