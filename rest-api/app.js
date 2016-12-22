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

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use("/tx", txModule);

//  Just for easy testing for now.  will switch to unit testing
app.get('/test/ppp/:address', function(req, res) {
  musicoinCore.setCredentials("0xd194c585c559684939a1bf1d31cddc40017ac9d4", "dummy1");
  musicoinCore.sendPPP(req.params.address)
    .then(function (result) {
      res.writeHead(200);
      res.write("Sending payment: " + result);
      res.end();
    })
    .catch(function (err) {
      res.status(500)
      res.write(JSON.stringify(err));
      res.end();
    });
});

app.get('/test/tip/:address', function(req, res) {
  musicoinCore.setCredentials("0xd194c585c559684939a1bf1d31cddc40017ac9d4", "dummy1");
  musicoinCore.sendTip(req.params.address, 1000000)
    .then(function (result) {
      res.writeHead(200);
      res.write("Sending payment: " + result);
      res.end();
    })
    .catch(function (err) {
      res.status(500)
      res.write(JSON.stringify(err));
      res.end();
    });
});

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
});
