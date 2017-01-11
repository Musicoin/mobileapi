const express = require('express');
const app = express();
const ConfigUtils = require('../components/config/config-utils');
const Web3Writer = require('../components/blockchain/web3-writer');
const mongoose = require('mongoose');
const config = ConfigUtils.loadConfig(process.argv);
const MusicoinCore = require("../mc-core");
const musicoinCore = new MusicoinCore(config);

const contractOwnerAccount = config.contractOwnerAccount;
const publishCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.publishingAccount, config.publishingAccountPassword);
const paymentAccountCredentialsProvider = Web3Writer.createInMemoryCredentialsProvider(config.paymentAccount, config.paymentAccountPassword);

const AccountManager = require("../components/account-manager");
const accountManager = new AccountManager();
const licenseModule = require("./license").init(musicoinCore.getLicenseModule(), accountManager, publishCredentialsProvider, paymentAccountCredentialsProvider, contractOwnerAccount);
const artistModule = require("./artist").init(musicoinCore.getArtistModule(), publishCredentialsProvider);
const txModule = require("./tx").init(musicoinCore.getTxModule());

musicoinCore.setCredentials(config.publishingAccount, config.publishingAccountPassword);
mongoose.connect(config.keyDatabaseUrl);

app.use("/", isKnownUser);

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use("/tx", txModule);
app.use("/balance/:address", function(req, res) {
  musicoinCore.getWeb3Reader().getBalanceInMusicoins(req.params.address)
    .then(function (output) {
      res.json({musicoins: output});
    })
    .catch(function (err) {
      console.log(`Request failed in ${name}: ${err}`);
      res.status(500);
      res.send(err);
    });
});

app.get("/sample/:address", isMashape, function(req, res) {
  res.json({address: req.params.address, key: req.headers});
});

function isKnownUser(req, res, next) {
  if (config.isDev) {
    req.user = { clientID: "clientID" };
    return next();
  }
  let clientID = req.headers["clientid"];
  if (clientID) {
    accountManager.validateClient(clientID)
      .then(function() {
        req.user = { clientID: clientID };
        next();
      })
      .catch(function(err) {
        console.warn(err);
        res.status(401).send({ error: 'Invalid clientid: ' + clientID});
    });
  }
  else {
    console.warn("No clientID provided");
    res.status(401).send({ error: 'Invalid user credentials, you must include a clientid header' });
  }
}

function isMashape(req, res, next) {
  // allow all requests when running in dev mode
  if (config.isDev) return next();

  const secret = req.headers['x-mashape-proxy-secret'] || req.headers['X-Mashape-Proxy-Secret'];
  if (secret == config.mashapeSecret) {
    next();
    return;
  }
  res.status(401).send({ error: 'Expected request from Mashape proxy' });
}

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
  console.log(JSON.stringify(config, null, 2));
});
