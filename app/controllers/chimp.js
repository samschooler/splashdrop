var MailChimpAPI = require('mailchimp').MailChimpAPI;

var apiKey = 'f48af030a63f3186bfaaf07ba9d71674-us7';

try {
  var api = new MailChimpAPI(apiKey, { version : '2.0' });
} catch (error) {
  console.log(error.message);
}

exports.subscribe = function(req, res, next){
  console.log(req.param('email'));
  if (req.param('email')=="" || !/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(req.param('email'))) /* ' */ {
    res.send("error; email : '"+ req.param('email') + "';");
  } else {
    api.call('lists', 'subscribe', { id: "0c7aa47de5", email: { email: req.param('email') } }, function (error, data) {
      if (error) {
        console.log(error.message);
        res.send("error_chimp");
      } else {
        req.session.subscribed = true;
        next();
      }
    });
  }
};
