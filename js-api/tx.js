const Promise = require('bluebird');
const Web3Reader = require('../components/blockchain/web3-reader');

function TransactionModule(web3Reader, licenseModule, artistModule) {
  this.web3Reader = web3Reader;
  this.licenseModule = licenseModule;
  this.artistModule = artistModule;
};

TransactionModule.prototype.getTransaction = function(hash) {
  return this.web3Reader.getTransaction(hash);
};

TransactionModule.prototype.getTransactionReceipt = function(hash) {
  return this.web3Reader.getTransactionReceipt(hash);
};

TransactionModule.prototype.getTransactionStatus = function(hash) {
  console.log(`Getting status of tx: "${hash}"`);
  return Promise.join(
    this.web3Reader.getTransaction(hash),
    this.web3Reader.getTransactionReceipt(hash),
    function(raw, receipt) {
      if (!raw) return {status: "unknown"};
      if (raw && !receipt) return {status: "pending"};
      if (raw.gas == receipt.gasUsed) return {status: "error"};
      return {status: "complete", receipt: receipt};
    });
};

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
      output.txType = this.web3Reader.getTransactionType(transaction);
      output.from = transaction.from;
      output.to = transaction.to;
      if (output.txType == Web3Reader.TxTypes.FUNCTION) {
        output.eventType = this.web3Reader.getFunctionType(transaction);
        output.licenseAddress = transaction.to;
      }
      else if (output.txType == Web3Reader.TxTypes.CREATION) {
        output.contractMetadata = this.web3Reader.getContractType(transaction.input);
        if (output.contractMetadata) {
          if (output.contractMetadata.type == Web3Reader.ContractTypes.PPP) {
            output.eventType = "newrelease";
            output.licenseAddress = context.receipt.contractAddress;
          }
          else if (output.contractMetadata.type == Web3Reader.ContractTypes.WORK) {
            output.eventType = "newwork";
            output.workAddress = context.receipt.contractAddress;
          }
          else if (output.contractMetadata.type == Web3Reader.ContractTypes.ARTIST) {
            output.eventType = "newartist";
            output.artistProfileAddress = context.receipt.contractAddress;
          }
        }
      }
      return Promise.resolve(null);
    })
    .then(function() {
      return output.licenseAddress
          ? this.licenseModule.getLicense(output.licenseAddress)
          : Promise.resolve(null);
    })
    .then(function(license) {
      if (license) {
        output.license = license;
        if (license.artistProfileAddress) {
          output.artistProfileAddress = license.artistProfileAddress;
        }
        output.ownerAddress = license.owner;
      }
      return output.artistProfileAddress
        ? this.artistModule.getArtistByProfile(output.artistProfileAddress)
        : Promise.resolve(null);
    })
    .then(function(artist) {
      if (artist) {
        output.artistProfile = artist;
      }
      return output;
    })
};

module.exports = TransactionModule;
