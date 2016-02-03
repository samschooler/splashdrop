var crypto = require('crypto');
var url = require('url');
var fs = require('fs');
var request = require('request');
var config = require('../../config/config');
var mongoose = require("mongoose");
var User = mongoose.model('User');
var Unsplash = require('./unsplash');

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

var _doUser = function(users, photos, i, cb) {
  function next() {
    console.log("");
    i++;
    if(i < users.length) {
      _doUser(users, photos, i, cb);
    } else {
      if(cb) cb();
    }
  }

  console.log("--------- DOING: "+users[i].email + " ---------");
  request.post('https://api.dropboxapi.com/1/metadata/auto/', {
    headers: { Authorization: 'Bearer ' + users[i].access_token },
    form: { list:true }
  }, function optionalCallback (err, httpResponse, body) {
    body = JSON.parse(body);
    if(body.error) {
      console.log("--- ERROR; SKIPPING USER: "+users[i].id);
      if(body.error == "The given OAuth 2 access token doesn't exist or has expired.") {
        console.log("--- TOKEN REVOKED; REMOVING USER: "+users[i].id);
        User.find({ _id: users[i].id }).remove(next);
      }
      return;
    }

    deletePhotos(users[i].access_token, body.contents, function() {
      uploadPhotos(users[i].access_token, photos, next());
    });
  });
};

var deletePhotos = function(token, photos, cb) {
  if(photos.length > 0) {
    _deletePhoto(token, photos, 0, cb);
  } else {
    if(cb) cb();
  }
};

var _deletePhoto = function(token, contents, i, cb) {
  request.post('https://api.dropboxapi.com/1/fileops/delete', {
    headers: { Authorization: 'Bearer ' + token},
    form: {root:"auto", path: contents[i].path}
  }, function optionalCallback (err, httpResponse, body) {
    if(body.error) {
      console.log("--- ERROR; SKIPPING USER: "+users[i].id);
      if(body.error == "The given OAuth 2 access token doesn't exist or has expired.") {
        console.log("--- TOKEN REVOKED; REMOVING USER: "+users[i].id);
        User.find({ _id: users[i].id }).remove(next);
      }
      return;
    }
    console.log("--- DELETED: "+contents[i].path);
    i++;
    if(i < contents.length) {
      _deletePhoto(token, contents, i, cb);
    } else {
      if(cb) cb();
    }
  });
};

var uploadPhotos = function(token, photos, cb) {
  if(photos.length > 0) {
    _uploadPhoto(token, photos, 0, cb);
  } else {
    if(cb) cb();
  }
};

var _uploadPhoto = function(token, photos, i, cb) {
  request.post('https://api.dropboxapi.com/1/save_url/auto/'+i+".jpg", {
    headers: { Authorization: 'Bearer ' + token},
    form: {url:photos[i].src.split("?")[0]}
  }, function optionalCallback (err, httpResponse, body) {
    if(body.error) {
      console.log("--- ERROR; SKIPPING USER: "+users[i].id);
      if(body.error == "The given OAuth 2 access token doesn't exist or has expired.") {
        console.log("--- TOKEN REVOKED; REMOVING USER: "+users[i].id);
        User.find({ _id: users[i].id }).remove(next);
      }
      return;
    }
    console.log("--- UPLOADED: "+i+".jpg");
    i++;
    if(i < photos.length) {
      _uploadPhoto(token, photos, i, cb);
    } else {
      if(cb) cb();
    }
  });
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
      req.session.uid=data.uid;
      req.session.token=data.access_token;

      request.post('https://api.dropbox.com/1/account/info', {
        headers: { Authorization: 'Bearer ' + token }
      }, function (error, response, body) {
        function continueStuff(user) {
          res.redirect("/push_photos");
        }

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
              continueStuff(user);
            });
          } else {
            user = usr;
            continueStuff(user);
          }
        });
      });
    });
  },
  update_photos: function(cb) {
    User.find(function (err, users) {
      if (err) return console.error(err);
      if(users.length > 0) {
        Unsplash.page(function (err, photos) {
          if (err) {
            console.log(JSON.stringify(err));
          }
          _doUser(users, photos, 0, cb);
        });
      } else if(cb) cb();
    });
  },
  push_photos_user: function(req, res) {
    User.findById(req.session.uid, function(err, user) {
      console.log(JSON.stringify(user));
      if (err) return console.error(err);
      if(user !== null) {
        Unsplash.page(function (err, photos) {
          if (err) {
            console.log(JSON.stringify(err));
          }
          _doUser([user], photos, 0);
          res.send("Hola");
        });
      } else {
        res.redirect("/");
      }
    });
  }
};
