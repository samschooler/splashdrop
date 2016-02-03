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
      var url = PREFIX + '/new';
      request.get(url, function (err, response, body) {
          if (err) {
              cb(err, null);
              return reject(err);
          }
          if (response.statusCode === 200) {
              var images = getImages(body);
              cb(null, images);
          } else {
              cb(reponse, null);
          }
      });
  }
};
