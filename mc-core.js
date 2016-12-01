const express = require('express');
const app = express();
const Web3Reader = require('./local/blockchain/web3-reader');
const MediaProvider = require('./local/media/media-provider');
const ConfigUtils = require('./local/config/config-utils');

const config = ConfigUtils.loadConfig(process.argv);
const web3Reader = new Web3Reader(config.web3Host);
const mediaProvider = new MediaProvider(config.ipfsHost);

const licenseModule = require("./modules/license").init(web3Reader, mediaProvider);
const artistModule = require("./modules/artist").init(web3Reader, mediaProvider);
const ipfsModule = require("./modules/ipfs").init(mediaProvider);

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use('/ipfs', ipfsModule);

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
});
