const express  = require('express');
const router = express.Router();
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
  licenseModule.getResourceStream(req.params.address)
    .then(function (result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});

router.get('/sample/:address', function(req, res) {
  licenseModule.sampleResourceStream(req.params.address, 50)
    .then(function (result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});


module.exports.init = function(_licenseModule) {
  licenseModule = _licenseModule;
  return router;
};
