var config = require("../../config/config");
var mongoose = require("mongoose");
var valid = require('card-validator');
var Order = mongoose.model('Order');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('5rFdziIB9Bb4cQIWYoxOrA');

var blankOrder = {
  products: [],
  quantity: 0,
  price: 0,
  fee: 2
};

function isFormValid(d) {
  var isValid = true;
  function isItemValid(value, isCustomValid, canBeEmpty) {
    if( !canBeEmpty && (value === "" || value === null) ||
        typeof isCustomValid !== 'undefined' && isCustomValid !== null && !isCustomValid(value) )
    {
      isValid = false;
      return false;
    } else {
      return true;
    }
  }

  isItemValid(d.name);
  isItemValid(d.last_name);
  isItemValid(d.phone, function(value) {
    return true;
  });

  isItemValid(d.address);
  isItemValid(d.zip);

  isItemValid(d.delivery_type, function(value) {
    switch (value) {
      case "now": return true;
      case "later": return true;
      default: return false;
    }
  });

  if(d.payment_type == "credit-card") {

  }

  return isValid;
}

function calcPrice(qt) {
  if(!parseInt(qt)) return 0;
  switch(parseInt(qt)) {
    case 0:  return 0;
    case 1:  return 2;
    case 2:  return 2.5;
    case 3:  return 3;
    case 4:  return 4;
    case 5:  return 5;
    case 6:  return 6;

    case 7:  return 7;
    case 8:  return 8;
    case 9:  return 9;
    case 10: return 10;
    case 11: return 11;
    case 12: return 12;

    case 13: return 13;
    case 14: return 14;
    case 15: return 15;
    case 16: return 16;
    case 17: return 17;
    case 18: return 18;

    case 19: return 19;
    case 20: return 20;
    case 21: return 21;
    case 22: return 22;
    case 23: return 23;
    case 24: return 24;
    default: return 0;
  }
}

exports.view = function(req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  res.json(req.session.order);
};

exports.orderAction = function (req, res) {
  if(typeof req.body["product-remove"] !== 'undefined') {
    req.body.action = "product-remove";
    req.body.itemId = req.body["product-remove"];
  }

  if(typeof req.params.itemId !== 'undefined' && req.path.indexOf('removeProduct/') > -1) {
    req.body.itemId = req.params.itemId;
  }

  console.log("Welcome to the order action interface! What do you want to do?");
  console.log("> "+req.body.action);
  switch(req.body.action) {
    case "product-add":
      console.log("Cool! lets add a product!");
      return addProduct(req, res);
    case "product-remove":
      console.log("Awesome! Lets remove that product!");
      return removeProduct(req, res);
    case "checkout":
      console.log("Lets get you checked out!");
      return submitOrder(req, res);
    default: return res.send();
  }
};

exports.addProduct = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  var newItem = {
    id: parseInt(req.body.itemId),
    name: "",
    quantity: parseInt(req.body.qtbtn) || parseInt(req.body.quantity),
    price: 0
  };

  if(newItem.id !== null && newItem.quantity !== null) {
    if(newItem.id === 0 || newItem.id == 1) {
      newItem.name = "Chocolate Chip Cookies";
    } else {
      res.status(401);
      res.send("401 You can't do that.");
      return;
    }

    if(newItem.quantity > 0  && newItem.quantity <= 25)
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
    req.session.order.price = calcPrice(req.session.order.quantity)+req.session.order.fee;
  } else {
    res.status(401);
    res.send("401 You can't do that.");
    return;
  }

  res.redirect('/order/shop');
};

exports.removeProduct = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  var itemId = req.body.itemId || req.params.itemId;

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

  res.redirect('/order/info');
};

var submitOrder = function (req, res) {
  var cData = {
    name: req.body.first_name,
    last_name: req.body.last_name,
    phone: req.body.phone,

    address: req.body.address,
    suite: req.body.suite,
    zip: req.body.zip,
    notes: req.body.notes,

    delivery_type: req.body.delivery_type,
    delivery_date: req.body.delivery_date,
    delivery_time: req.body.delivery_time,
    delivery_products: req.session.order.products,
    delivery_fee: req.session.order.fee,
    delivery_price: req.session.order.price,

    payment_type: req.body.payment_type,
    payment_nonce: req.body.payment_method_nonce || null,
  };

  var error = !isFormValid(cData);

  if(error) {
    console.log("error!");
    res.status(401);
    res.send();
  }

  var order = new Order(cData);
  order.save(function (err) {
    if (err) {
      console.log(JSON.stringify(err));
    }
    console.log('meow');
  });

  var completeOrder = function(err, result) {
    var message = {
      "subject": "New Order! "+ new Date(),
      "html": '<?xml version="1.0" encoding="utf-8" standalone="no"?> <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> <html xmlns="http://www.w3.org/1999/xhtml"> <head> <meta http-equiv="Content-Type" content="text/html; charset=utf-8" /> <title>RollerBakers Order</title> <style type="text/css"> body {margin: 0; padding: 0; min-width: 100%!important;} </style> </head> <body> <table width="100%" border="0" cellpadding="0" cellspacing="10"> <tbody> <tr> <td> <table style="width:100%;" cellpadding="3" cellspacing="0" border="0"> <tbody> <tr> <td><h2 style="margin: 0px 0px 0px 0px;">New Order:</h2></td> <td><h2 style="color:#6cc0e5;font-weight:bold;margin:0;" align="right">'+cData.payment_type+'</h2></td> </tr> <tr> <td><h2 style="color:#fbc93d;font-weight:normal;margin:0;text-transform:uppercase;">'+cData.delivery_date+'</h2></td> </tr> <tr> <td><h2 style="color:#fb4f4f;font-weight:bold;margin:0;">'+cData.delivery_time+'</h2></td> </tr> </tbody> </table> <h4 style="margin: 10px 0px 5px 0px;">Orderer Info</h4> <table style="width:100%;" cellpadding="3" cellspacing="0" border="1"> <tbody> <tr><td>Name: </td><td>'+cData.name+' '+cData.last_name+'</td></tr> <tr><td>Phone: </td><td>'+cData.phone+'</td></tr> </tbody> </table> </td> </tr> <tr> <td> <h4 style="margin:10px 0px 5px 0px;">Delivery Info</h4> <table style="width:100%;" cellpadding="3" cellspacing="0" border="1"> <tbody> <tr><td>Address: </td><td>'+cData.address+'</td></tr> <tr><td>Suite: </td><td>'+cData.suite+'</td></tr> <tr><td>Zip: </td><td>'+cData.zip+'</td></tr> <tr><td>Notes: </td><td>'+cData.notes+'</td></tr> </tbody> </table> </td> </tr> <tr> <td> <h4 style="margin:10px 0px 5px 0px;">Order</h4> <table style="width:100%;" cellpadding="3" cellspacing="0" border="1"> <tbody> <tr><th>Product</th><th>Qty.</th><th>Price</th></tr>',
      "from_email": "order@rollerbakers.com",
      "from_name": "Rollerbakers",
      "to": [{"email": "rollerbakers@gmail.com"}]
    };
    for (var i = 0; i < cData.delivery_products.length; i++) {
      message.html += '<tr><td>'+cData.delivery_products[i].name+'</td><td>'+cData.delivery_products[i].quantity+'</td><td>$'+cData.delivery_products[0].price+'</td></tr>';
    }
    message.html += '<tr><td></td><td></td><td></td></tr> <tr><td><b>Delivery</b></td><td></td><td>$'+cData.delivery_fee+'</td></tr> <tr><td><b>Total</b></td><td>'+cData.delivery_total_quantity+'</td><td><b>$'+cData.delivery_price+'</b></td></tr> </tbody> </table> </td> </tr> </tbody> </table> </body> </html>';
    var async = false;
    var ip_pool = "Main Pool";

    mandrill_client.messages.send({
      "message": message,
      "async": async,
      "ip_pool": ip_pool
    }, function(result) {
      console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    });
  };
  if(cData.payment_type == "credit-card") {
    config.gateway.transaction.sale({
      amount: cData.delivery_price,
      paymentMethodNonce: req.body.payment_method_nonce,
    }, completeOrder);
    res.redirect('/order/success');
  } else {
    completeOrder(null, "");
    res.redirect('/order/success');
  }
};
