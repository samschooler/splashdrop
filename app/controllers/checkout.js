exports.shop = function (req, res) {
  if(!req.session.order) {
    req.session.order = {};
  }
  res.render('checkout/shop', {
    title: 'RollerBakers',
    order: req.session.order
  });
};
exports.order = function (req, res) {
  if(!req.session.order) {
    req.session.order = {};
  }
  res.render('checkout/order', {
    title: 'RollerBakers',
    order: req.session.order
  });
};
