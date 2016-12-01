var Promise = require('bluebird');
const LicenseModule = require('./license');
function TransactionModule(web3Reader, mediaProvider) {
  this.web3Reader = web3Reader;
  this.mediaProvider = mediaProvider;
  this.licenseModule = new LicenseModule(web3Reader, mediaProvider);
}

TransactionModule.prototype.loadTransactionDetails = function(hash) {
  const context = {};
  return this.web3Reader.getTransaction(hash)
    .bind(this)
    .then(function(transaction) {
      context.transaction = transaction;
      transaction.eventType = this.web3Reader.getEventType(transaction);
      if (transaction.eventType == "play" || transaction.eventType == "tip") {
        return this.licenseModule.getLicense(transaction.to);
      }
      return Promise.resolve(null);
    })
    .then(function(license) {
      if (license) {
        context.transaction.license = license;
      }
      return context.transaction;
    })
};

module.exports = TransactionModule;
