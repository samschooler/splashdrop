var request = require('request');
var fs = require('fs')
var cheerio = require('cheerio');
var PROTOCAL = 'https';
var HOST = 'unsplash.com';
var PREFIX = PROTOCAL + '://' + HOST;

var getImages = function getImages(html) {
    var $ = cheerio.load(html);
    var $photoContainers = $('.photo-container');
    var images = [];
    $photoContainers.each(function (i, photoContainer) {
        var $photoContainer = $(photoContainer);
        var $photo = $photoContainer.find('.photo');
        var $photoDesc = $photoContainer.find('.photo-description');
        var $img = $photo.find('img');
        var downloadLink = $photo.find('>a').attr('href');
        var imgSrc = $img.attr('src');
        var $links = $photoDesc.find('a');
        var $author = $links.eq(1);
        var authorName = $author.text();
        var authorLink = $author.attr('href');
        images.push({
            download: PROTOCAL + '://' + HOST + downloadLink,
            authorPage: PROTOCAL + '://' + HOST + '/' + authorLink,
            src: imgSrc,
            author: authorName
        });
    });
    return images;
};

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

module.exports = {
  page: function(cb) {
      var url = PREFIX + '/';
      request.get(url, function (err, response, body) {
          if (err) {
              cb(err, null);
              return reject(err);
          }
          if (response.statusCode === 200) {
              var images = getImages(body);
              if(cb) cb(null, images);
          } else {
              if(cb) cb(reponse, null);
          }
      });
  },
  randoms: function(cb) {
      var num = 15;
      var _photos = [];
      var at = 0;
      var url = 'https://api.unsplash.com/photos/random?client_id=bf93960c3661a6bfa24e9cde976afe75b96cffc96f0d6882e875c4696f91717d&featured=true&orientation=landscape';

      console.log("--- LOADING UNSPLASH...");
      var _random = function(at, cb) {
        console.log("--- GETTING PHOTO: "+at);
        request.get(url, function (err, response, body) {
            var body = JSON.parse(body);
            console.log(JSON.stringify(body));
            if (err || !body.urls) {
              if(cb) cb(err, null);
              return;
            }

            _photos.push({ src: body.urls.full });

            if(at < num) {
              at++;
              _random(at, cb);
            } else {
              if(cb) cb(null, _photos);
            }
        });
      };

      if(num > 0) {
        _random(0, cb);
      } else if(cb) cb(null);
  }
};
