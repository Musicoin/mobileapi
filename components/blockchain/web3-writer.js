const Promise = require("bluebird");

function Web3Writer(web3, web3Reader) {
  this.web3 = web3;
  this.web3Reader = web3Reader;
}

Web3Writer.prototype.setCredentialsProvider = function(provider) {
  this.credentialsProvider = provider;
};

Web3Writer.createInMemoryCredentialsProvider = function(account, password) {
  return {
    getCredentials: function() {
      return Promise.resolve({
        account: account,
        password: password
      });
    }
  }
};

Web3Writer.prototype.unlockAccount = function (provider) {
  provider = provider || this.credentialsProvider;
  if (!provider)
    throw new Error("You must provider a credentials provider or call setCredentialsProvider sending transactions");

  return provider.getCredentials()
    .bind(this)
    .then(function(credentials) {
      return this.unlockAccountWithCredentials(credentials);
    })
};

Web3Writer.prototype.unlockAccountWithCredentials = function (credentials) {
  return new Promise(function (resolve, reject) {
    this.web3.personal.unlockAccount(credentials.account, credentials.password, 10, function(err, result) {
      if (result) {
        resolve(credentials.account);
      }
      else {
        reject(new Error("Unlocking account failed: " + err));
      }
    });
  }.bind(this));
};

Web3Writer.prototype.tipLicense = function (licenseAddress, weiTipAmount, credentialsProvider) {
  return this.unlockAccount(credentialsProvider)
    .bind(this)
    .then(function(account) {
      const contract = this.web3Reader.getLicenseContractInstance(licenseAddress);
      const params = {from: account, value: weiTipAmount, gas: 940000};
      return new Promise(function(resolve, reject) {
        contract.tip(params, function (err, tx) {
          if (err) reject(err);
          else resolve(tx);
        });
      })
    })
    .then(function(tx) {
      console.log("Sending tip, tx: " + tx);
      return tx;
    })
};

Web3Writer.prototype.ppp = function (licenseAddress, credentialsProvider) {
  return Promise.join(
    this.web3Reader.loadLicense(licenseAddress),
    this.unlockAccount(credentialsProvider),
    function(license, sender) {
      const contract = this.web3Reader.getLicenseContractInstance(licenseAddress);
      const params = {from: sender, value: license.weiPerPlay, gas: 940000};
      return new Promise(function(resolve, reject) {
        contract.play(params, function (err, tx) {
          if (err) reject(err);
          else resolve(tx);
        });
      })
    }.bind(this))
    .then(function(tx) {
      console.log("Sending ppp, tx: " + tx);
      return tx;
    });
};

module.exports = Web3Writer;