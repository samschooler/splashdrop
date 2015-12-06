var config = require("config");
var mongoose = require("mongoose");
var Order = mongoose.model('Order');

var blankOrder = {
  products: [],
  quantity: 0,
  price: 0
};

function calcPrice(qt) {
<<<<<<< HEAD
  if(!parseInt(qt)) return 0;
  switch(parseInt(qt)) {
    case 0:  return 0;
    case 1:  return 3;
    case 2:  return 4;
    case 3:  return 5;
    case 4:  return 6;
    case 5:  return 7;
    case 6:  return 8;

    case 7:  return 10;
    case 8:  return 11;
    case 9:  return 12;
    case 10: return 13;
    case 11: return 14;
    case 12: return 15;

    case 13: return 17;
    case 14: return 18;
    case 15: return 19;
    case 16: return 20;
    case 17: return 21;
    case 18: return 22;

    case 19: return 24;
    case 20: return 25;
    case 21: return 26;
    case 22: return 27;
    case 23: return 28;
    case 24: return 29;
    default: return 0;
  }
=======
  return (qt === 0 ? 0 : Math.floor( ((qt*1.3)+1.5) - qt/8 ));
>>>>>>> master
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

<<<<<<< HEAD
exports.changeOrder = function (req, res) {
  console.log("Welcome to change order! What do you want to do?");
  console.log("> "+req.body.action);
  switch(req.body.action) {
    case "product-add":
      console.log("Cool! lets add a product!");
      return addProduct(req, res);
    case "product-remove":
      console.log("Awesome! Lets remove that product!");
      return removeProduct(req, res);
    default: return res.send();
  }
};

var addProduct = function (req, res) {
=======
exports.addProduct = function (req, res) {
>>>>>>> master
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  console.log(JSON.stringify(req.body));

  var newItem = {
<<<<<<< HEAD
    id: parseInt(req.body.itemId),
=======
    id: parseInt(req.params.productId),
>>>>>>> master
    name: "",
    quantity: parseInt(req.body.qtbtn) || parseInt(req.body.quantity),
    price: 0
  };

  if(newItem.id !== null && newItem.quantity !== null) {
<<<<<<< HEAD
    if(newItem.id === 0 || newItem.id == 1) {
=======
    if(newItem.id === 0) {
>>>>>>> master
      newItem.name = "Chocolate Chip Cookies";
    } else {
      res.status(401);
      res.send("401 You can't do that.");
      return;
    }

<<<<<<< HEAD
    if(newItem.quantity > 0  && newItem.quantity <= 25)
=======
    if(newItem.quantity == 3  || newItem.quantity == 6  || newItem.quantity == 9  ||
       newItem.quantity == 12 || newItem.quantity == 15 || newItem.quantity == 18 ||
       newItem.quantity == 21 || newItem.quantity == 24)
>>>>>>> master
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

<<<<<<< HEAD
var removeProduct = function (req, res) {
=======
exports.removeProduct = function (req, res) {
>>>>>>> master
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

<<<<<<< HEAD
  console.log(JSON.stringify(req.body));

  var itemId = req.body.itemId;
=======
  var itemId = req.body.removeItem;
>>>>>>> master

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
<<<<<<< HEAD
  var cData = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,

    address: req.body.address,
    suite: req.body.suite,
    city: req.body.city,
    state: req.body.street,
    zip: req.body.zip,
    notes: req.body.notes,

    delivery_type: req.body.delivery_type,
    delivery_date: req.body.delivery_date,

    payment_type: (req.body.payment_method_nonce ? "credit-card" : "cash" ),
    payment_nonce: req.body.payment_method_nonce || ""
  };

  // DO FUCKING VALIDATION

  var order = new Order(cData);
  order.save(function (err) {
    if (err) {
      console.log(JSON.stringify(err));
    }
    console.log('meow');
  });
=======
  var order = new Order();

>>>>>>> master

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
