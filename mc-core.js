const express = require('express');
const app = express();
const Web3Reader = require('./components/blockchain/web3-reader');
const MediaProvider = require('./components/media/media-provider');
const ConfigUtils = require('./components/config/config-utils');

const config = ConfigUtils.loadConfig(process.argv);
const web3Reader = new Web3Reader(config.web3Host);
const mediaProvider = new MediaProvider(config.ipfsHost);

const licenseModule = require("./rest-api/license").init(web3Reader, mediaProvider);
const artistModule = require("./rest-api/artist").init(web3Reader, mediaProvider);
const ipfsModule = require("./rest-api/ipfs").init(mediaProvider);
const txModule = require("./rest-api/tx").init(web3Reader, mediaProvider);

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use('/ipfs', ipfsModule);
app.use("/tx", txModule);

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
});
