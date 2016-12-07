const express = require('express');
const router = express.Router();
let txModule;

router.get('/detail/:hash', function(req, res) {
  txModule.getTransactionDetails(req.params.hash)
    .then(function(output) {
      res.json(output);
    })
    .catch(function(err) {
      res.status(500)
      res.send(err);
    })
});

module.exports.init = function(_txModule) {
  txModule = _txModule;
  return router;
};
