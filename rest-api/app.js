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

app.listen(config.port, function () {
  console.log('Listening on port ' + config.port);
});
