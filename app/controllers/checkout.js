var config = require('../../config/config');

var blankOrder = {
  products: [],
  quantity: 0,
  price: 0,
  fee: 2
};
function isValidZip(zip) {
  switch (zip) {
    case "80210": return true;
    default:      return false;
  }
}

exports.address = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  if(isValidZip(req.session.order.zip)) {
    res.redirect('/order/shop');
    return;
  }


  res.render('checkout/checkAddress', {
    title: 'RollerBakers',
    order: req.session.order,
    csrfToken: req.csrfToken()
  });
};

exports.checkAddress = function(req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }


  if(!isValidZip(req.body["delivery-zip"])) {
    res.render('checkout/checkAddress', {
      title: 'RollerBakers',
      isError: true,
      order: req.session.order,
      csrfToken: req.csrfToken()
    });
  } else {
    req.session.order.zip = req.body["delivery-zip"];
    res.redirect('/order/shop');
    return;
  }
};

exports.shop = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  if(!isValidZip(req.session.order.zip)) {
    req.session.order = blankOrder;
    res.redirect('/order');
    return;
  }


  res.render('checkout/shop', {
    title: 'RollerBakers',
    order: req.session.order,
    csrfToken: req.csrfToken()
  });
};


exports.info = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }
  if(!isValidZip(req.session.order.zip)) {
    req.session.order = blankOrder;
    res.redirect('/order');
    return;
  }


  res.render('checkout/order', {
    title: 'RollerBakers',
    order: req.session.order,
    csrfToken: req.csrfToken()
  });
};

exports.success = function (req, res) {
  if(!req.session.order) {
    req.session.order = blankOrder;
  }

  res.render('checkout/success', {
    title: 'RollerBakers',
    order: req.session.order,
    subscribed: req.session.subscribed,
    csrfToken: req.csrfToken()
  });

  req.session.order = blankOrder;
};

exports.getOrderToken = function (req, res) {
  config.gateway.clientToken.generate({}, function (err, response) {
     if(response) res.send(response.clientToken || "");
     else res.send("");
   });
};
