var request = require('request');
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
      var url = 'https://source.unsplash.com/random/featured';

      console.log("--- LOADING UNSPLASH...");
      var _random = function(at, cb) {
        console.log("--- GETTING PHOTO: "+at);
        request.get(url, function (err, response, body) {
            if (err) {
              if(cb) cb(err, null);
              return;
            }

            _photos.push({ src: response.request.href.split("?")[0] });

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
