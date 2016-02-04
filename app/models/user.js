
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var UserSchema = new Schema({
  _id: String,
  name: String,
  email: String,
  access_token: String,
  init_push: Boolean
});

mongoose.model('User', UserSchema);
