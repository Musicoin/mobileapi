var express  = require('express');
var router = express.Router();
const TransactionModule = require('../js-api/tx');
const LicenseModule = require('../js-api/license');
var txModule;

router.get('/detail/:hash', function(req, res) {
  txModule.loadTransactionDetails(req.params.hash)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_web3Reader, _mediaProvider) {
  txModule = new TransactionModule(_web3Reader, _mediaProvider);
  return router;
};
