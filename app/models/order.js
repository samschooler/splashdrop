
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
  name: { type: String, default: '' },
  phone: { type: Number, default: '' },
  email: { type: String, default: '' },

  address: { type: String, default: '' },
  suite: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: Number, default: '' },
  notes: { type: String, default: '' },

  payment_type: { type: String, default: '' },

  delivery_type: { type: String, default: '' },
  delivery_date: { type: Date, default: '' },
  delivery_items: { type: Object, default: '' },
  delivery_price: { type: Number, default: 0.00 },
});

mongoose.model('Order', OrderSchema);
