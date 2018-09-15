const Promise = require('bluebird');
const LicenseKey = require('../../db/core/key');
const defaultRecords = 20;
const maxRecords = 100;
const defaultMaxGroupSize = 8;

function getLimit(req) {
  return Math.max(0, Math.min(req.query.limit || defaultRecords, maxRecords));
}

class LicenseController {

  constructor(_licenseModule, _accountManager, _publishCredentialsProvider, _paymentAccountCredentialsProvider, _contractOwnerAccount) {
    this.accountManager = _accountManager;
    this.licenseModule = _licenseModule;
    this.publishCredentialsProvider = _publishCredentialsProvider;
    this.paymentAccountCredentialsProvider = _paymentAccountCredentialsProvider;
    this.contractOwnerAccount = _contractOwnerAccount;
  }

  getDetails(Request, Response) {
    this.licenseModule.getLicense(Request.params.address).then(res => {
      Response.send(res)
    })
  }

  getAudioUrlByAddress(Request, Response) {
    this.licenseModule.getAudioLicense(Request.params.address).then(res => {
      Response.send(res)
    })
  }

  getNewReleases(Request, Response) {
    this.licenseModule.getNewReleases(getLimit(Request))
  }

  getTopPlayed(Request, Response) {
    this.licenseModule.getTopPlayed(getLimit(Request), Request.query.genre).then(res => {
      Response.send(res)
    })
  }

  getRandom(Request, Response) {
    this.licenseModule.getSampleOfVerifiedTracks(getLimit(Request), Request.query.genre).then(res => {
      Response.send(res)
    })
  }

  getRandomNew(Request, Response) {
    this.licenseModule.doGetRandomReleases({ ...Request.query,
      limit: getLimit(Request)
    }).then(res => {
      Response.send(res)
    });
  }

  getDetailsByAddresses(Request, Response) {
    this.licenseModule.getTrackDetailsByIds(Request.query.addresses).then(res => {
      Response.send(res)
    });
  }

  find(Request, Response) {
    this.licenseModule.getNewReleasesByGenre(getLimit(Request), defaultMaxGroupSize, Request.query.search).then(res => {
      Response.send(res)
    });
  }

  getPppByAddress(Request, Response) {
    const context = {};
    const l = licenseModule.getLicense(Request.params.address);
    const k = new Promise(function(resolve, reject) {
      LicenseKey.findOne({
        licenseAddress: Request.params.address
      }, function(err, licenseKey) {
        if (!licenseKey) return reject({
          err: "License not found: " + Request.params.address
        });
        return resolve({
          key: licenseKey.key
        });
      })
    });

    Promise.join(l, k, function(license, keyResult) {
        context.output = keyResult;
        return this.accountManager.pay(Request.user.clientID, license.weiPerPlay);
      })
      .then(function() {
        return licenseModule.ppp(Request.params.address, this.paymentAccountCredentialsProvider);
      })
      .then(function(tx) {
        console.log(`Initiated payment, tx: ${tx}`);
        context.output.tx = tx;
        Response.send(context.output);
      })
      .catch(function(err) {
        console.log(err);
        Response.status(400);
        Response.send({
          err: "Failed to acquire key or payment was rejected"
        });
      })
  }

  distributeBalance(Request, Response) {
    licenseModule.distributeBalance(Request.body.address)
      .then(tx => {
        Response.send({
          tx: tx
        });
      })
      .catch(function(err) {
        Response.status(500)
        Response.send(err);
      });
  }

  update(Request, Response) {
    console.log("Received license UPDATE release request: " + JSON.stringify(Request.body));
    licenseModule.updatePPPLicense({
        contractAddress: Request.body.contractAddress,
        title: Request.body.title,
        imageUrl: Request.body.imageUrl,
        metadataUrl: Request.body.metadataUrl,
        contributors: Request.body.contributors,
        coinsPerPlay: 1
      }, this.publishCredentialsProvider)
      .then(txs => {
        Response.json({
          txs: txs
        });
      })
      .catch(err => {
        console.log(err);
        Response.status(500);
        Response.send(err);
      });
  }

  getAll(Request, Response) {
    console.log("Received license release request: " + JSON.stringify(Request.body));
    this.publishCredentialsProvider.getCredentials()
      .then(function(credentials) {
        return licenseModule.releaseLicense({
          owner: this.contractOwnerAccount,
          profileAddress: Request.body.profileAddress,
          artistName: Request.body.artistName,
          title: Request.body.title,
          resourceUrl: Request.body.audioUrl,
          contentType: Request.body.contentType,
          imageUrl: Request.body.imageUrl,
          metadataUrl: Request.body.metadataUrl,
          coinsPerPlay: 1,
          royalties: Request.body.royalties || [],
          contributors: Request.body.contributors || [{
            address: Request.body.profileAddress,
            shares: 1
          }]
        }, this.publishCredentialsProvider)
      })
      .then(function(tx) {
        console.log("Got transaction hash for release request: " + tx);
        res.json({
          tx: tx
        });
        const newKey = new LicenseKey();
        newKey.tx = tx;
        newKey.key = Request.body.encryptionKey;
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
              } else {
                Response.send(newKey);
              }
            });
          })
      })
      .catch(err => {
        console.log(err);
        Response.status(500);
        Response.send(err);
      });
  }
}

module.exports = LicenseController;
