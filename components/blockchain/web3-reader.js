const Promise = require('bluebird');
const Web3 = require('web3');
const ArrayUtils = require('./array-utils');
const fs = require('fs');
const pppMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/PayPerPlay.sol.abi'));
const workAbi = JSON.parse(fs.readFileSync('solidity/mvp2/Work.sol.abi'));
const artistAbi = JSON.parse(fs.readFileSync('solidity/mvp2/Artist.sol.abi'));

function Web3Reader(rpcServer) {
  this.web3 = new Web3();
  this.web3.setProvider(new this.web3.providers.HttpProvider(rpcServer));
  this.eventTypeMapping = {};
  this.eventTypeMapping[this.web3.sha3('tip()').substring(0, 10)] = 'tip';
  this.eventTypeMapping[this.web3.sha3('play()').substring(0, 10)] = 'play';
  this.eventTypeMapping['0x'] = 'payment';

}

Web3Reader.prototype.loadLicense = function(licenseAddress) {
  console.log("Loading license: " + licenseAddress);
  const licensePromise = this.loadContract(licenseAddress, pppMvp2Abi);

  // extracting the arrays takes some extra work
  const c = Promise.promisifyAll(this.web3.eth.contract(pppMvp2Abi).at(licenseAddress));
  const contributorPromise = ArrayUtils.extractAddressAndValues(c.contributorsAsync, c.contributorSharesAsync, "shares");
  const royaltyPromise = ArrayUtils.extractAddressAndValues(c.royaltiesAsync, c.royaltyAmountsAsync, "amount");

  return Promise.join(licensePromise, contributorPromise, royaltyPromise,
    function(licenseObject, contributors, royalties) {
      licenseObject.contributors = contributors;
      licenseObject.royalties = royalties;

      // for convenience, do the conversion to "coins" from wei
      licenseObject.coinsPerPlay = this.web3.fromWei(licenseObject.weiPerPlay, 'ether');
      licenseObject.address = licenseAddress;

      // load details from the associated "work" directly into the licenseObject
      return this.loadWork(licenseObject.workAddress, licenseObject);
    }.bind(this));
};

Web3Reader.prototype.loadArtist = function(artistAddress, output) {
  return this.loadContract(artistAddress, artistAbi, output);
};

Web3Reader.prototype.loadWork = function(workAddress, output) {
  return this.loadContract(workAddress, workAbi, output);
};

Web3Reader.prototype.loadContract = function(address, abi, outputObject) {
  return this.loadContractAndFields(address, abi, this.getConstantFields(abi), outputObject);
};

Web3Reader.prototype.getEventType = function(transaction) {
  if (transaction.to == null) return "creation";
  return this.eventTypeMapping[transaction.input];
};

Web3Reader.prototype.getTransaction = function(tx) {
  return new Promise(function(resolve, reject) {
    this.web3.eth.getTransaction(tx, function(error, transaction) {
      if (error) reject(error);
      else resolve(transaction);
    })
  }.bind(this));
};

/*
 * Loads the given fields into a JSON object asynchronously
 */
Web3Reader.prototype.loadContractAndFields = function(address, abi, fields, outputObject) {
  const c = Promise.promisifyAll(this.web3.eth.contract(abi).at(address));
  var promises = fields.map(function (f) {
    if (c[f + "Async"]) return c[f + "Async"]();
    return Promise.resolve(f + " not found");
  });

  return Promise.all(promises)
    .then(function (results) {
      var output = outputObject || {};
      fields.forEach(function (f, idx) {
        output[f] = results[idx];
      });
      return output;
    });
};

Web3Reader.prototype.getConstantFields = function(abi) {
  return abi
    .filter(function(field) {
      return field.constant && field.type == "function" && field.inputs && field.inputs.length == 0
    })
    .map(function(field) {
      return field.name;
    })
};

module.exports = Web3Reader;

