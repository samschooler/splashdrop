
/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'SplashUp'
  });
};
exports.working = function (req, res) {
  require('./unsplash').randoms();
  res.render('home/working', {
    title: 'SplashUp | Working...'
  });
};
