var crypto = require('crypto');
var url = require('url');
var fs = require('fs');
var request = require('request');
var config = require('../../config/config');
var mongoose = require("mongoose");
var User = mongoose.model('User');
var Unsplash = require('./unsplash');

function random (min, max) {
    return Math.floor(Math.random() * (max - min +1)) + min;
}

var generateRedirectURI = function(req) {
  return url.format({
    protocol: 'http',
    host: req.headers.host,
    pathname: '/success'
  });
};

var generateCSRFToken = function() {
  return crypto.randomBytes(18).toString('base64')
    .replace("///g, '-').replace(/+/g, '_'");
};

var _doUser = function(users, photos, i, cb) {
  console.log("--------- DOING: "+users[i].email + " ---------");
  deletePhotos(users[i].access_token, function() {
    uploadPhotos(users[i].access_token, photos, function() {
      console.log("");
      i++;
      if(i < users.length) {
        _doUser(users, photos, i, cb);
      } else {
        if(cb) cb();
      }
    });
  });
};

var deletePhotos = function(token, cb) {
  request.post('https://api.dropboxapi.com/1/metadata/auto/', {
    headers: { Authorization: 'Bearer ' + token},
    form: {list:true}
  }, function optionalCallback (err, httpResponse, body) {
    body = JSON.parse(body);
    if(body.contents.length > 0) {
      _deletePhoto(token, body.contents, 0, cb);
    } else {
      if(cb) cb();
    }
  });
};

var _deletePhoto = function(token, contents, i, cb) {
  request.post('https://api.dropboxapi.com/1/fileops/delete', {
    headers: { Authorization: 'Bearer ' + token},
    form: {root:"auto", path: contents[i].path}
  }, function optionalCallback (err, httpResponse, body) {
    if(err) {
      console.log(err);
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
    if(err) {
      console.log(err);
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

var uploadPhoto = function(token, fileName, url, cb) {
  request.post('https://api.dropboxapi.com/1/save_url/auto/'+fileName, {
    headers: { Authorization: 'Bearer ' + token},
    form: {url:url}
  }, function optionalCallback (err, httpResponse, bodymsg) {
    if(cb) cb(err, bodymsg);
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
  },
  update_photos: function(cb) {
    User.find(function (err, users) {
      if (err) return console.error(err);
      if(users.length > 0) {
        var ran = random(1, 10);
        console.log("--- PAGE: "+ran);
        Unsplash.page(ran, function (err, photos) {
          if (err) {
            console.log(JSON.stringify(err));
          }
          _doUser(users, photos, 0, cb);
        });
      }
    });
  }
};
