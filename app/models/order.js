
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  name: String,
  last_name: String,
  phone: Number,
  email: String,

  address: String,
  suite: String,
  city: String,
  state: String,
  zip: Number,
  notes: String,

  payment_type: String,
  payment_nonce: String,

  delivery_type: String,
  delivery_date: Date,
  delivery_products: Object,
  delivery_fee: Number,
  delivery_price: Number,
});

mongoose.model('Order', OrderSchema);
