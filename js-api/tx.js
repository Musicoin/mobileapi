var Promise = require('bluebird');
const LicenseModule = require('./license');
const ArtistModule = require('./artist');

function TransactionModule(web3Reader, mediaProvider) {
  this.web3Reader = web3Reader;
  this.mediaProvider = mediaProvider;
  this.licenseModule = new LicenseModule(web3Reader, mediaProvider);
  this.artistModule = new ArtistModule(web3Reader, mediaProvider);
}

// 0x0ca5827720ca163b177d838087029d705574a29c0652c6c6a8e528f6de4b2101
// 0x5ee69c60fbd37a0cfc036ba14a85088cf2cc2c0e539e53adc1617052a1a16823
// 0xb63faac108e69f2072d3e91565b171abf43662decfcd74dc26e2bada87c98241
TransactionModule.prototype.getTransactionDetails = function(hash) {
  const context = {};
  const output = {
    transactionHash: hash
  };
  return this.web3Reader.getTransactionReceipt(hash)
    .bind(this)
    .then(function(receipt) {
      context.receipt = receipt;
      return this.web3Reader.getTransaction(hash);
    })
    .then(function(transaction) {
      output.eventType = this.web3Reader.getEventType(transaction);
      output.from = transaction.from;
      output.to = transaction.to;
      if (output.eventType == "play" || output.eventType == "tip") {
        return this.licenseModule.getLicense(transaction.to);
      }
      else if (output.eventType == "creation") {
        output.contractMetadata = this.web3Reader.getContractType(transaction.input);
        return this.licenseModule.getLicense(context.receipt.contractAddress);
      }
      return Promise.resolve(null);
    })
    .then(function(license) {
      if (license) {
        output.license = license;
        return this.artistModule.getArtist(license.owner);
      }
      return Promise.resolve(null);
    })
    .then(function(artist) {
      if (artist) {
        output.artistProfile = artist;
      }
      return output;
    })
};

module.exports = TransactionModule;
