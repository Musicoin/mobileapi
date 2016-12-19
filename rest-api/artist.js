const express = require('express');
const router = express.Router();
var jsonParser = require('body-parser').json();
let artistModule;

router.get('/detail/:address', function(req, res) {
  artistModule.getArtistByOwner(req.params.address)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

router.post('/profile/', jsonParser, function(req, res, next) {
  const releaseRequest = {
    profileAddress: req.body.profileAddress,
    owner: "0xd194c585c559684939a1bf1d31cddc40017ac9d4",
    artistName: req.body.artistName,
    imageUrl: req.body.imageUrl,
    socialUrl: req.body.socialUrl,
    descriptionUrl: req.body.descriptionUrl
  };
  console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
  artistModule.releaseProfile(releaseRequest)
    .then(function(account) {
      res.json({profileAddress: account})
    })
    .catch(next);
});

router.get('/profile/:address', function(req, res) {
  artistModule.getArtistByProfile(req.params.address)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_artistModule) {
  artistModule = _artistModule;
  return router;
};
