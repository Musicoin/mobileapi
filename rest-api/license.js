const express  = require('express');
const router = express.Router();
var jsonParser = require('body-parser').json();
let licenseModule;
let publishCredentialsProvider;
const LicenseKey = require('../components/models/key');

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

router.post('/', jsonParser, function(req, res) {
  console.log("Received license release request: " + JSON.stringify(req.body));
  publishCredentialsProvider.getCredentials()
    .then(function(credentials) {
      return licenseModule.releaseLicense({
        owner: credentials.account,
        profileAddress: req.body.profileAddress,
        title: req.body.title,
        resourceUrl: req.body.audioUrl,
        imageUrl: req.body.imageUrl,
        metadataUrl: req.body.metadataUrl,
        coinsPerPlay: 1,
        royalties: [],
        contributors: [{address: req.body.profileAddress, shares: 1}]
      }, publishCredentialsProvider)
    })
    .then(function(tx) {
      console.log("Got transaction hash for release request: " + tx);
      res.json({tx: tx});
      const newKey = new LicenseKey();
      newKey.tx = tx;
      newKey.key = req.body.encryptionKey;
      newKey.save(err => {
        if (err) console.log(`Failed to save key: ${err}`)
      });

      console.log("Waiting for tx: " + tx);
      licenseModule.getWeb3Reader().waitForTransaction(tx)
        .then(function(receipt) {
          console.log("Got receipt: " + JSON.stringify(receipt));
          newKey.licenseAddress = receipt.contractAddress;
          newKey.save(function(err) {
            if (err) {
              console.log("Failed to save license key!");
              throw err;
            }
            else {
              console.log("Saved key!");
            }
          });
        })
    })
    .catch(err => {
      console.log(err);
      res.status(500);
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


module.exports.init = function(_licenseModule, _publishCredentialsProvider) {
  licenseModule = _licenseModule;
  publishCredentialsProvider = _publishCredentialsProvider;
  return router;
};
