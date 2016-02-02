var crypto = require('crypto');
var url = require('url');
var request = require('request');
var config = require('../../config/config');
var mongoose = require("mongoose");
var User = mongoose.model('User');

var generateRedirectURI = function(req) {
  return url.format({
    protocol: 'https',
    host: req.headers.host,
    pathname: '/success'
  });
};
var generateCSRFToken = function() {
  return crypto.randomBytes(18).toString('base64')
    .replace("///g, '-').replace(/+/g, '_'");
};

module.exports = {
  authorize: function(req, res) {
    var csrfToken = generateCSRFToken();
    res.cookie('csrf', csrfToken);
    res.redirect(url.format({
      protocol: 'https',
      hostname: 'www.dropbox.com',
      pathname: '1/oauth2/authorize',
      query: {
        client_id: config.dropbox.key,//App key of dropbox api
        response_type: 'code',
        state: csrfToken,
        redirect_uri: generateRedirectURI(req)
      }
    }));
  },
  success: function (req, res) {
    if (req.query.error) {
      return res.send('ERROR ' + req.query.error + ': ' + req.query.error_description);
    }

    if (req.query.state !== req.cookies.csrf) {
      return res.status(401).send(
        'CSRF token mismatch, possible cross-site request forgery attempt.'
      );
    }

    request.post('https://api.dropbox.com/1/oauth2/token', {
      form: {
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: generateRedirectURI(req)
      },
      auth: {
        user: config.dropbox.key,
        pass: config.dropbox.secret
      }
    }, function (error, response, body) {
      var data = JSON.parse(body);
      if (data.error) {
        return res.send('ERROR: ' + data.error);
      }

      var token = data.access_token;
      req.session.token=data.access_token;

      request.post('https://api.dropbox.com/1/account/info', {
        headers: { Authorization: 'Bearer ' + token }
      }, function (error, response, body) {
        var info = JSON.parse(body);
        var user;
        User.findByIdAndUpdate(info.uid, {
          $set: {
            name: info.display_name,
            email: info.email,
            access_token: token
          }
        }, function(err, usr) {
          if(usr === null) {
            user = new User({
              _id: info.uid,
              name: info.display_name,
              email: info.email,
              access_token: token
            });
            user.save(function (err) {
              if (err) {
                console.log(JSON.stringify(err));
              }
              console.log('meow');
            });
          } else {
            user = usr;
          }
        });
        res.send('Logged in successfully as ' + info.display_name + '.');
      });
    });
  }
};
