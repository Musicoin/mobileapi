const express = require('express');
const JsonPromiseRouter = require('./json-promise-router');
const router = express.Router();
const jsonRouter = new JsonPromiseRouter(router, "artist");
const jsonParser = require('body-parser').json();
let artistModule;
let publishCredentialsProvider;

jsonRouter.get('/profile/:address', req => artistModule.getArtistByProfile(req.params.address));
jsonRouter.post('/profile/', jsonParser, function(req, res, next) {
  return publishCredentialsProvider.getCredentials()
    .then(function(credentials) {
      const releaseRequest = {
        profileAddress: req.body.profileAddress,
        owner: credentials.account,
        artistName: req.body.artistName,
        imageUrl: req.body.imageUrl,
        socialUrl: req.body.socialUrl,
        descriptionUrl: req.body.descriptionUrl
      };
      console.log("Got profile POST request: " + JSON.stringify(releaseRequest));
      return artistModule.releaseProfile(releaseRequest)
    })
    .then(function(tx) {
      return {tx: tx};
    });
});

jsonRouter.post('/send/', jsonParser, function(req, res, next) {
  return artistModule.sendFromProfile(req.body.profileAddress, req.body.recipientAddress, req.body.musicoins)
    .then(function(tx) {
      return {tx: tx};
    });
});


module.exports.init = function(_artistModule, _publishCredentialsProvider) {
  artistModule = _artistModule;
  publishCredentialsProvider = _publishCredentialsProvider;
  return router;
};
