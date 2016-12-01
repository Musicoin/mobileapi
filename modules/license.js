const Promise = require('bluebird');
const express  = require('express');
const crypto = require('crypto');
const router = express.Router();
const constant = '36e6f1d1cd2ff2cd7bb75a359';
var web3Reader;
var mediaProvider;

router.param('address', function(req, res, next, address){
  web3Reader.loadLicense(address)
    .then(function(license) {
      if (!license)
        throw new Error("Failed to load license: " + address);

      req.license = license;
      next();
    })
    .catch(function(err) {
      next(err);
    });
});

router.get('/detail/:address', function(req, res) {
  res.json(req.license);
});

router.get('/resource/:address', function(req, res) {
  mediaProvider.getIpfsResource(req.license.resourceUrl, function () {
    return _computeKey(req.license.artist, req.license.title);
  })
    .then(function (result) {
      res.writeHead(200, result.headers);
      result.stream.pipe(res);
    })
    .catch(function (err) {
      res.status(500)
      res.send(err);
    });
});

const _computeKey = function(v1, v2) {
  const seed = v1 + " " + v2 + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
};

module.exports.init = function(_web3Reader, _mediaProvider) {
  web3Reader = _web3Reader;
  mediaProvider = _mediaProvider;
  return router;
};
