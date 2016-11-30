const Promise = require('bluebird');
const Web3 = require('web3');
const ArrayUtils = require('./array-utils');
const fs = require('fs');
const pppMvp2Abi = JSON.parse(fs.readFileSync('solidity/mvp2/PayPerPlay.sol.abi'));
const workAbi = JSON.parse(fs.readFileSync('solidity/mvp2/Work.sol.abi'));

function Web3Reader(rpcServer) {
  this.web3 = new Web3();
  this.web3.setProvider(new this.web3.providers.HttpProvider(rpcServer));
}

Web3Reader.prototype.loadLicense = function(licenseAddress) {
  console.log("Loading license: " + licenseAddress);
  const c = Promise.promisifyAll(this.web3.eth.contract(pppMvp2Abi).at(licenseAddress));

  const contributorPromise = ArrayUtils.extractAddressAndValues(c.contributorsAsync, c.contributorSharesAsync, "shares");
  const royaltyPromise = ArrayUtils.extractAddressAndValues(c.royaltiesAsync, c.royaltyAmountsAsync, "amount");

  return Promise.join(
    c.workAddressAsync(),
    c.weiPerPlayAsync(),
    c.tipCountAsync(),
    c.totalEarnedAsync(),
    c.ownerAsync(),
    c.resourceUrlAsync(),
    c.metadataUrlAsync(),
    contributorPromise,
    royaltyPromise,

    function(workAddress, weiPerPlay, tipCount, totalEarned, owner, resourceUrl, metadataUrl, contributors, royalties) {
      return {
        address: licenseAddress,
        contract_id: licenseAddress,
        workAddress: workAddress,
        weiPerPlay: weiPerPlay,
        coinsPerPlay: this.web3.fromWei(weiPerPlay, 'ether'),
        tipCount: tipCount,
        totalEarned: totalEarned,
        owner: owner,
        resourceUrl: resourceUrl,
        contributors: contributors,
        royalties: royalties
      }
    }.bind(this))
    .bind(this)
    .then(function(license) {
      return this.loadWork(license.workAddress)
        .then(function(work) {
          license.title = work.title;
          license.artist = work.artist;
          license.imageUrl = work.imageUrl;
          license.metadataUrl = work.metadataUrl;
          return license;
        })
        .catch(function(err) {
          throw err;
        });
    })
    .then(function(license) {
      return license;
    });
};

Web3Reader.prototype.loadWork = function(workAddress) {
  const c = Promise.promisifyAll(this.web3.eth.contract(workAbi).at(workAddress));
  return Promise.join(
    c.titleAsync(),
    c.artistAsync(),
    c.imageUrlAsync(),
    c.metadataUrlAsync(),
    function(title, artist, imageUrl, metadataUrl) {
      return {
        address: workAddress,
        title: title,
        artist: artist,
        imageUrl: imageUrl,
        metadataUrl: metadataUrl,
      }
    }
  )
};

module.exports = Web3Reader;

