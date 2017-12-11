var request = require('request');
var sharp = require('sharp');
var smartcrop = require('smartcrop-sharp');

function applySmartCrop(src, dest, width, height) {
  request(src, {encoding: null}, function process(error, response, body) {
    if (error) return console.error(error);
    smartcrop.crop(body, {width: width, height: height}).then(function(result) {
      var crop = result.topCrop;
      sharp(body)
        .extract({width: crop.width, height: crop.height, left: crop.x, top: crop.y})
        .resize(width, height)
        .toFile(dest);
    });
  });
}

exports.applySmartCrop = applySmartCrop;