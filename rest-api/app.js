const express = require('express');
const app = express();
const ConfigUtils = require('../components/config/config-utils');
const Web3Writer = require('../components/blockchain/web3-writer');
const mongoose = require('mongoose');
const config = ConfigUtils.loadConfig(process.argv);

const MusicoinCore = require("../mc-core");
const musicoinCore = new MusicoinCore(config);

const contractOwnerAccount = config.contractOwnerAddress;
const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);

const licenseModule = require("./license").init(musicoinCore.getLicenseModule(), publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
const artistModule = require("./artist").init(musicoinCore.getArtistModule(), publishCredentialsProvider);
const txModule = require("./tx").init(musicoinCore.getTxModule());

// TODO: Load credentials from env variables
musicoinCore.setCredentials(config.publishingAccount, config.publishingAccountPassword);
mongoose.connect(config.keyDatabaseUrl);

// app.use("/", isMashape);

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use("/tx", txModule);

app.get("/sample/:address", isMashape, function(req, res) {
  res.json({address: req.params.address});
});

function isMashape(req, res, next) {
  // allow all requests when running in dev mode
  if (config.isDev) return next();

  const secret = req.headers['x-mashape-proxy-secret'] || req.headers['X-Mashape-Proxy-Secret'];
  if (secret == config.mashapeSecret) {
    next();
    return;
  }
  res.status(401).send({ error: 'Unauthorized request' });
}

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
  console.log(JSON.stringify(config, null, 2));
});
