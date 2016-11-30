const Promise = require('bluebird');
const express = require('express');
const app = express();
const Web3Reader = require('./local/blockchain/web3-reader');
const MediaProvider = require('./local/media/media-provider');
const ConfigUtils = require('./local/config/config-utils');

const config = ConfigUtils.loadConfig(process.argv);
const web3Reader = new Web3Reader(config.web3Host);
const mediaProvider = new MediaProvider(web3Reader, config.ipfsHost);

app.get('/license/detail/:address', function(req, res) {
  web3Reader.loadLicense(req.params.address)
    .then(function(result) {
      res.json(result);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

app.get('/license/resource/:address', function(req, res) {
  mediaProvider.getLicenseResource(req.params.address)
    .then(function (result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});

app.get('/artist/detail/:address', function(req, res) {
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

app.get('/ipfs/:hash', function(req, res) {
  mediaProvider.getRawIpfsResource(req.params.hash)
    .then(function(result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function(err) {
      console.error(err.stack);
      res.status(500);
      res.send(err);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
