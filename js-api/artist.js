const Promise = require('bluebird');
const request = require('request');

function ArtistModule(web3Reader, web3Writer, maxCoinsPerPlay) {
  this.web3Reader = web3Reader;
  this.web3Writer = web3Writer;
  this.maxCoinsPerPlay = maxCoinsPerPlay;
};

ArtistModule.prototype.getArtistByProfile = function(profileAddress) {
  return this.web3Reader.getArtistByProfile(profileAddress);
};

ArtistModule.prototype.sendFromProfile = function(profileAddress, recipient, musicoins) {
  return this.web3Writer.sendFromProfile(profileAddress, recipient, musicoins);
};

ArtistModule.prototype.pppFromProfile = function(profileAddress, licenseAddress, hotWalletCredentialsProvider) {
  const context = {};
  return Promise.join(
    this.web3Reader.loadLicense(licenseAddress),
    hotWalletCredentialsProvider.getCredentials(),
    (license, hotWallet) => {
      if (license.coinsPerPlay > this.maxCoinsPerPlay) {
        throw new Error(`license exceeds max coins per play, ${license.coinsPerPlay} > ${this.maxCoinsPerPlay}`)
      }
      return this.sendFromProfile(profileAddress, hotWallet.account, license.coinsPerPlay)
    })
    .then(tx => {
      context.paymentToHotWalletTx = tx;
      console.log("PPP payment: profile => hot-wallet: " + tx);
      return this.web3Writer.ppp(licenseAddress, hotWalletCredentialsProvider);
    })
    .then(tx => {
      context.paymentToLicenseTx = tx;
      console.log("PPP payment: hot-wallet => license: " + tx);
      return context;
    })
};

/**
 * @param releaseRequest A JSON object with the following properties:
 * {
 *    owner: The address of the profile owner, which has administrative rights over the account
 *    artistName: "Some Artist",
 *    descriptionUrl: a URL indicating the location (likely ipfs://hash) of the description doc
 *    socialUrl: a URL indicating the location (likely ipfs://hash) of the social JSON document
 *    imageUrl: a URL indicating the location (likely ipfs://hash) of the profile image
 * }
 * @param credentialsProvider: The credentials provider that will unlock the web3 account
 * @returns {Promise<string>} A Promise that will resolve to transaction hash
 */
ArtistModule.prototype.releaseProfile = function(releaseRequest, credentialsProvider) {
  return this.web3Writer.releaseArtistProfile(releaseRequest, credentialsProvider);
};

module.exports = ArtistModule;
