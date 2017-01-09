const Promise = require('bluebird');
const express  = require('express');
const JsonPromiseRouter = require('./json-promise-router');
const router = express.Router();
const jsonRouter = new JsonPromiseRouter(router, "artist");
var jsonParser = require('body-parser').json();
let licenseModule;
let publishCredentialsProvider;
let paymentAccountCredentialsProvider;
let contractOwnerAccount;
let accountManager;
const LicenseKey = require('../components/models/key');

jsonRouter.get('/detail/:address', (req, res) => licenseModule.getLicense(req.params.address));
jsonRouter.get('/ppp/:address', (req, res) => {
  const context = {};

  const l = licenseModule.getLicense(req.params.address);
  const k = new Promise(function(resolve, reject) {
    LicenseKey.findOne({licenseAddress: req.params.address}, function(err, licenseKey) {
      if (!licenseKey) return reject({err: "License not found: " + req.params.address});
      return resolve({key: licenseKey.key});
    })
  });

  return Promise.join(l, k, function(license, keyResult) {
    context.output = keyResult;
    return accountManager.pay(req.user.clientID, license.weiPerPlay);
  })
    .then(function() {
      return licenseModule.ppp(req.params.address, paymentAccountCredentialsProvider);
    })
    .then(function(tx) {
      console.log(`Initiated payment, tx: ${tx}`);
      return context.output;
    })
    .catch(function(err) {
      console.log(err);
      return {err: "Failed to acquire key or payment was rejected"};
    })
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
        owner: contractOwnerAccount,
        profileAddress: req.body.profileAddress,
        title: req.body.title,
        resourceUrl: req.body.audioUrl,
        contentType: req.body.contentType,
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

module.exports.init = function(_licenseModule, _accountManager, _publishCredentialsProvider, _paymentAccountCredentialsProvider, _contractOwnerAccount) {
  accountManager = _accountManager;
  licenseModule = _licenseModule;
  publishCredentialsProvider = _publishCredentialsProvider;
  paymentAccountCredentialsProvider = _paymentAccountCredentialsProvider;
  contractOwnerAccount = _contractOwnerAccount;
  return router;
};
