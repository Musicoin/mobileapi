var express  = require('express');
var router = express.Router();
const ArtistModule = require('../js-api/artist');
var artistModule;

router.get('/detail/:address', function(req, res) {
  artistModule.loadArtist(req.params.address)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_web3Reader, _mediaProvider) {
  artistModule = new ArtistModule(_web3Reader, _mediaProvider);
  return router;
};
