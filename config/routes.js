
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var home = require('../app/controllers/home');
var checkout = require('../app/controllers/checkout');
var cart = require('../app/controllers/cart');
var chimp = require('../app/controllers/chimp');

/**
 * Expose
 */

module.exports = function (app, passport) {

  app .get('/', home.index);
  app .get('/order', function(req, res) { res.redirect('/order/address'); } );
  app .get('/order/address', checkout.address);
  app .get('/order/shop', checkout.shop);
  app .get('/order/info', checkout.info);
  app .get('/order/success', checkout.success);
  app.post('/order/success', chimp.subscribe, checkout.success);


  app .post('/order/address', checkout.checkAddress);

  app.post('/order', cart.orderAction);
  app.post('/order/removeProduct/:itemId', cart.orderAction);
  app .get('/order/clientToken', checkout.getOrderToken);

  app .get('/order/api', cart.view);
  app.post('/order/api/addProduct', cart.addProduct);
  app.post('/order/api/removeProduct', cart.removeProduct);
  app .get('/order/api/removeProduct/:itemId', cart.removeProduct);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if(err.message && (~err.message.indexOf('not found') ||
      (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
