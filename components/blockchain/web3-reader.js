const Promise = require('bluebird');
const ArrayUtils = require('./array-utils');
const fs = require('fs');
const pppMvp2Abi = JSON.parse(fs.readFileSync(__dirname + '/../../solidity/mvp2/PayPerPlay.sol.abi'));
const workAbi = JSON.parse(fs.readFileSync(__dirname + '/../../solidity/mvp2/Work.sol.abi'));
const artistAbi = JSON.parse(fs.readFileSync(__dirname + '/../../solidity/mvp2/Artist.sol.abi'));
const SolidityUtils = require("./solidity-utils");

const TxTypes = Object.freeze({
  FUNCTION: "function",
  CREATION: "creation",
  EXCHANGE: "exchange",
  UNKNOWN: "unknown"
});

const FunctionTypes = Object.freeze({
  PLAY: "play",
  TIP: "tip",
  UNKNOWN: "unknown"
});

const ContractTypes = Object.freeze({
  PPP: "ppp",
  ARTIST: "artist",
  WORK: "work",
  UNKNOWN: "unknown"
});
Web3Reader.TxTypes = TxTypes;
Web3Reader.ContractTypes = ContractTypes;
Web3Reader.FunctionTypes = FunctionTypes;

const knownContracts = [
  {
    codeLength: 20850,
    codeHash: "0x2cbaccdf9ee4827a97b24bc8533b118ac01c83450906a77e75bdc1ad3b992b54",
    type: ContractTypes.PPP,
    version: "v0.2",
    abi: pppMvp2Abi
  },
  {
    codeLength: 7705,
    codeHash: "0xe0e61252714ecac51d023f49502a3df25ba7e035e83364848f536b365bc46f8a",
    type: ContractTypes.ARTIST,
    version: "v0.1",
    abi: artistAbi
  }
];

function Web3Reader(web3) {
  this.web3 = web3;

  this.txTypeMapping = {};
  this.txTypeMapping[this.web3.sha3('tip()').substring(0, 10)] = TxTypes.FUNCTION;
  this.txTypeMapping[this.web3.sha3('play()').substring(0, 10)] = TxTypes.FUNCTION;
  this.txTypeMapping['0x'] = TxTypes.EXCHANGE;

  this.functionTypeMapping = {};
  this.functionTypeMapping[this.web3.sha3('tip()').substring(0, 10)] = FunctionTypes.TIP;
  this.functionTypeMapping[this.web3.sha3('play()').substring(0, 10)] = FunctionTypes.PLAY;

  this.pppV5 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp5/PayPerPlay.json');
  this.artistV2 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp5/Artist.json');

  knownContracts.push(this.pppV5);
  knownContracts.push(this.artistV2);
};

Web3Reader.getDependencies = function() {
  return {web3: null};
};

Web3Reader.prototype.getContractDefinition = function(type, version) {
  return knownContracts.filter(function(d) { return d.type == type && d.version == version})[0];
};

Web3Reader.prototype.loadLicense = function(licenseAddress) {
  console.log("Loading license: " + licenseAddress);

  // load the oldest supported version and extract the actual version from the contract
  const tempContract = this.web3.eth.contract(pppMvp2Abi).at(licenseAddress);
  return Promise.promisify(tempContract.contractVersion)()
    .bind(this)
    .then(function(version) {
      return this.getContractDefinition(ContractTypes.PPP, version);
    })
    .then(function(definition) {
      const licensePromise = this.loadContract(licenseAddress, definition.abi);
      // extracting the arrays takes some extra work
      const c = Promise.promisifyAll(this.web3.eth.contract(definition.abi).at(licenseAddress));
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
          // TODO: remove "loadWork" call, since we are moving to a single license model
          return licenseObject.workAddress
            ? this.loadWork(licenseObject.workAddress, licenseObject)
            : licenseObject;
        }.bind(this));
    });
};

Web3Reader.prototype.getArtistByProfile = function(profileAddress, output) {
  return this.loadContract(profileAddress, artistAbi, output);
};

Web3Reader.prototype.getArtistByOwner = function(artistAddress, output) {
  artistAddress = this.lookupProfileAddress(artistAddress);
  return this.loadContract(artistAddress, artistAbi, output);
};

Web3Reader.prototype.lookupProfileAddress = function(ownerAddress) {
  // TODO: Hack
  const lookup = {};
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

  lookup['0x008d4c913ca41f1f8d73b43d8fa536da423f1fb4'] = {
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

Web3Reader.prototype.getFunctionType = function(transaction) {
  return this.functionTypeMapping[transaction.input] || FunctionTypes.UNKNOWN;
};

Web3Reader.prototype.getTransactionType = function(transaction) {
  if (transaction.to == null) {
    return TxTypes.CREATION;
  }
  return this.txTypeMapping[transaction.input];
};

Web3Reader.prototype.getContractType = function(code) {
  for (let i=0; i < knownContracts.length; i++) {
    const template = knownContracts[i];
    if (code.length >= template.codeLength) {
      const codeHash = this.web3.sha3(code.substr(0, template.codeLength));
      if (codeHash == template.codeHash) {
        return {
          type: template.type,
          version: template.version
        };
      }
    }
  }
  return {
    type: ContractTypes.UNKNOWN,
    version: "unknown"
  };
};

Web3Reader.prototype.getTransaction = function(tx) {
  return new Promise(function(resolve, reject) {
    this.web3.eth.getTransaction(tx, function(error, transaction) {
      if (error) reject(error);
      else resolve(transaction);
    })
  }.bind(this));
};

Web3Reader.prototype.getTransactionReceipt = function(tx) {
  return new Promise(function(resolve, reject) {
    this.web3.eth.getTransactionReceipt(tx, function(error, receipt) {
      if (error) reject(error);
      else resolve(receipt);
    })
  }.bind(this));
};

Web3Reader.prototype.getLicenseContractInstance = function(licenseAddress) {
  return this.web3.eth.contract(pppMvp2Abi).at(licenseAddress);
};

Web3Reader.prototype.getContractAt = function(abi, address) {
  return Promise.promisifyAll(this.web3.eth.contract(abi).at(address));
};

/*
 * Loads the given fields into a JSON object asynchronously
 */
Web3Reader.prototype.loadContractAndFields = function(address, abi, fields, outputObject) {
  const c = Promise.promisifyAll(this.web3.eth.contract(abi).at(address));
  const promises = fields.map(f => {
    if (c[f + "Async"]) return c[f + "Async"]();
    return Promise.resolve(f + " not found");
  });

  return Promise.all(promises)
    .then(function (results) {
      const output = outputObject || {};
      fields.forEach((f, idx) => output[f] = results[idx]);
      return output;
    });
};

Web3Reader.prototype.getConstantFields = function(abi) {
  return abi
    .filter(field => field.constant && field.type == "function" && field.inputs && field.inputs.length == 0)
    .map(field => field.name)
};

Web3Reader.prototype.waitForTransaction = function (expectedTx) {
  return new Promise(function(resolve, reject) {
    let count = 0;
    const filter = this.web3.eth.filter('latest');
    filter.watch(function (error, result) {
      if (error) console.log("Error: " + error);
      if (result) console.log("Result: " + result);
      count++;

      if (count > 10) {
        console.log("Giving up on tx " + expectedTx);
        reject(new Error("Transaction was not confirmed"));
        filter.stopWatching();
      }

      // each time a new block comes in, see if our tx is in it
      this.web3.eth.getTransactionReceipt(expectedTx, function(error, receipt) {
        if (receipt && receipt.transactionHash == expectedTx) {
          console.log("Got receipt: " + expectedTx + ", blockHash: " + receipt.blockHash);
          this.web3.eth.getTransaction(expectedTx, function (error, transaction) {
            if (transaction.gas == receipt.gasUsed) {
              // wtf?! This is the only way to check for an error??
              filter.stopWatching();
              reject(new Error("Out of gas (or an error was thrown)"));
            }
            else if (receipt.blockHash) {
              console.log("Confirmed " + expectedTx);
              console.log("Block hash " + receipt.blockHash);
              filter.stopWatching();
              resolve(receipt);
            }
            else {
              console.log("Waiting for confirmation of " + expectedTx);
            }
          }.bind(this));
        }
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Web3Reader.prototype.getWeb3 = function() {
  return this.web3;
};

module.exports = Web3Reader;

