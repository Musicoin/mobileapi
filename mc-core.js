const Promise = require('bluebird');
const express = require('express');
const app = express();
const Web3Reader = require('./local/blockchain/web3-reader');
const MediaProvider = require('./local/media/media-provider');
const ConfigUtils = require('./local/config/config-utils');

const config = ConfigUtils.loadConfig(process.argv);
const web3Reader = new Web3Reader(config.web3Host);
const mediaProvider = new MediaProvider(web3Reader, config.ipfsHost);

app.get('/getLicense/:address', function(req, res) {
  web3Reader.loadLicense(req.params.address)
    .then(function(result) {
      console.log("Got result");
      res.json(result);
    })
    .catch(function(err) {
      console.log("Got err: " + JSON.stringify(err));
      res.status(500)
      res.send(err);
    })
});

app.get('/media/:address', function(req, res) {
  mediaProvider.handleRequest(req, res);
});

app.get('/artist/:address', function(req, res) {
  mediaProvider.handleRequest(req, res);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});
