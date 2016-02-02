
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var userPlugin = require('mongoose-user');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  access_token: String,
});

mongoose.model('User', UserSchema);
