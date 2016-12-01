var Promise = require('bluebird');
var express  = require('express');
var router = express.Router();
var web3Reader;
var mediaProvider;

router.get('/detail/:address', function(req, res) {
  web3Reader.loadArtist(req.params.address)
    .then(function(result) {
      var d = mediaProvider.readTextFromIpfs(result.descriptionUrl);
      var s = mediaProvider.readJsonFromIpfs(result.socialUrl);
      return Promise.join(d, s, function(description, social) {
        result.description = description;
        result.social = social;
        result.image = mediaProvider.resolveIpfsUrl(result.imageUrl);
        return result;
      })
    })
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_web3Reader, _mediaProvider) {
  web3Reader = _web3Reader;
  mediaProvider = _mediaProvider;
  return router;
};
