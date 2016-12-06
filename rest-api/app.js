const express = require('express');
const app = express();
const ConfigUtils = require('../components/config/config-utils');

const config = ConfigUtils.loadConfig(process.argv);

const MusicoinCore = require("../mc-core");
const musicoinCore = new MusicoinCore(config);

const licenseModule = require("./license").init(musicoinCore.getLicenseModule());
const artistModule = require("./artist").init(musicoinCore.getArtistModule());
const ipfsModule = require("./ipfs").init(musicoinCore.getMediaProvider());
const txModule = require("./tx").init(musicoinCore.getTxModule());

app.use("/license", licenseModule);
app.use('/artist', artistModule);
app.use('/ipfs', ipfsModule);
app.use("/tx", txModule);

app.get('/ppp/:address', function(req, res) {
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

app.get('/tip/:address', function(req, res) {
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
