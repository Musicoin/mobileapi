const express = require('express');
const router = express.Router();
let txModule;

router.get('/detail/:hash', function(req, res) {
  handleJsonPromise(txModule.getTransactionDetails(req.params.hash));
});

router.get('/raw/:hash', function(req, res) {
  handleJsonPromise(txModule.getTransaction(req.params.hash), res);
});

router.get('/receipt/:hash', function(req, res) {
  handleJsonPromise(txModule.getTransactionReceipt(req.params.hash), res);
});

router.get('/status/:hash', function(req, res) {
  handleJsonPromise(txModule.getTransactionStatus(req.params.hash), res);
});

function handleJsonPromise(p, res) {
  p.then(function (output) {
    res.json(output);
  })
    .catch(function (err) {
      console.log("Request failed: " + err);
      res.status(500);
      res.send(err);
    });
}

module.exports.init = function(_txModule) {
  txModule = _txModule;
  return router;
};
