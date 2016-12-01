const express  = require('express');
const router = express.Router();
const LicenseModule = require('../js-api/license');
var licenseModule;

router.get('/detail/:address', function(req, res) {
  licenseModule.getLicense(req.params.address)
    .then(function(result) {
      res.json(result);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});

router.get('/resource/:address', function(req, res) {
  licenseModule.getResource(req.params.address)
    .then(function (result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});


module.exports.init = function(_web3Reader, _mediaProvider) {
  licenseModule = new LicenseModule(_web3Reader, _mediaProvider);
  return router;
};
