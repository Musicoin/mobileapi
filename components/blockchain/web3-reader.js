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

Web3Reader.prototype.getArtist = function(artistAddress, output) {
  artistAddress = this.lookupProfileAddress(artistAddress);
  return this.loadContract(artistAddress, artistAbi, output);
};

Web3Reader.prototype.lookupProfileAddress = function(ownerAddress) {
  // TODO: Hack
  var lookup = {};
  lookup['0x6cf4e1d23f69d9a7df1e3e8b3f7f674c7c93a1fd'] = {
    name: 'Lobo Loco',
    profileAddress: '0xe0288b127fbe0f5BfCa4254A6859F139fa06413E'
  };

  lookup['0x1269f9bd6aa7d3a4ab4db83dda2a439c1ef06ecd'] = {
    name: 'Xenobia',
    profileAddress: '0x85E505F358CD600126650128F8e6B6be52Ec9Fe4'
  };

  lookup['0xd9b87b28449de9a45560fadace31300fcc50e68b'] = {
    name: 'Tofuku',
    profileAddress: '0xb3B15E688844151C9C0aEb9Ea0647eFbf164546d'
  };

  lookup['0xd9b87b28449de9a45560fadace31300fcc50e68b'] = {
    name: 'Porceline',
    profileAddress: '0x9aBc7B43868161BF6f73f41DaE6854d2191a0A28'
  };

  lookup['0xd9b87b28449de9a45560fadace31300fcc50e68b'] = {
    name: 'Dan Phifer',
    profileAddress: '0xb4dbe3aF8E1d37963Cc782773bDC1dCcC120E7c6'
  };

  if (lookup[ownerAddress]) {
    return lookup[ownerAddress].profileAddress;
  }
  return '0xb4dbe3aF8E1d37963Cc782773bDC1dCcC120E7c6';
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

