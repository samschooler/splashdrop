var config = require("config");
var mongoose = require("mongoose");
var Order = mongoose.model('Order');

var blankOrder = {
  products: [],
  quantity: 0,
  price: 0
};

function calcPrice(qt) {
  return (qt === 0 ? 0 : Math.floor( ((qt*1.3)+1.5) - qt/8 ));
}

exports.shop = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  console.log(JSON.stringify(req.session));
  res.render('checkout/shop', {
    title: 'RollerBakers',
    order: req.session.order,
    csrfToken: req.csrfToken()
  });
};

exports.addProduct = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  console.log(JSON.stringify(req.body));

  var newItem = {
    id: parseInt(req.params.productId),
    name: "",
    quantity: parseInt(req.body.qtbtn) || parseInt(req.body.quantity),
    price: 0
  };

  if(newItem.id !== null && newItem.quantity !== null) {
    if(newItem.id === 0) {
      newItem.name = "Chocolate Chip Cookies";
    } else {
      res.status(401);
      res.send("401 You can't do that.");
      return;
    }

    if(newItem.quantity == 3  || newItem.quantity == 6  || newItem.quantity == 9  ||
       newItem.quantity == 12 || newItem.quantity == 15 || newItem.quantity == 18 ||
       newItem.quantity == 21 || newItem.quantity == 24)
    {
      newItem.price = calcPrice(newItem.quantity);
    } else {
      res.status(401);
      res.send("401 You can't do that.");
      return;
    }

    var added = false;
    for (var i = 0; i < req.session.order.products.length; i++) {
      if(req.session.order.products[i].id == newItem.id) {
        req.session.order.quantity -= req.session.order.products[i].quantity;
        req.session.order.products[i] = newItem;
        added = true;
      }
    }
    if(!added) {
      req.session.order.products.push(newItem);
    }

    req.session.order.quantity += newItem.quantity;
    req.session.order.price = calcPrice(req.session.order.quantity);
  } else {
    res.status(401);
    res.send("401 You can't do that.");
    return;
  }

  res.redirect('/shop');
};

exports.removeProduct = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  var itemId = req.body.removeItem;

  if(itemId !== null) {
    for (var i = 0; i < req.session.order.products.length; i++) {
      if(itemId == req.session.order.products[i].id) {
        req.session.order.quantity -= req.session.order.products[i].quantity;
        req.session.order.price = calcPrice(req.session.order.quantity);
        req.session.order.products.splice(i, 1);
        break;
      }
    }
  }

  res.redirect('/order');
};

exports.getOrderToken = function (req, res) {
  config.gateway.clientToken.generate({}, function (err, response) {
     res.send(response.clientToken);
   });
};

exports.order = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  res.render('checkout/order', {
    title: 'RollerBakers',
    order: req.session.order,
    csrfToken: req.csrfToken()
  });
};

exports.submitOrder = function (req, res) {
  var order = new Order();


  config.gateway.transaction.sale({
    amount: '1.00',
    paymentMethodNonce: req.body.payment_method_nonce,
  }, function (err, result) {
    console.log(JSON.stringify(result));
    console.log(JSON.stringify(err));
    res.redirect('/order/success');
    res.send();
  });
};
