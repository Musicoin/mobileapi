const Web3Reader = require('./components/blockchain/web3-reader');
const MediaProvider = require('./components/media/media-provider');
const ArtistModule = require('./js-api/artist');
const LicenseModule = require('./js-api/license');
const TxModule = require('./js-api/tx');

function MusicoinCore(config) {
  this.web3Reader = new Web3Reader(config.web3Host);
  this.mediaProvider = new MediaProvider(config.ipfsHost);

  this.artistModule = new ArtistModule(this.web3Reader, this.mediaProvider);
  this.licenseModule = new LicenseModule(this.web3Reader, this.mediaProvider);
  this.txModule = new TxModule(this.web3Reader, this.mediaProvider);
}

MusicoinCore.prototype.getArtistModule = function() { return this.artistModule };
MusicoinCore.prototype.getLicenseModule = function() {  return this.licenseModule };
MusicoinCore.prototype.getTxModule = function() {  return this.txModule };
MusicoinCore.prototype.getMediaProvier = function() {  return this.mediaProvider };
MusicoinCore.prototype.getWeb3Reader = function() {  return this.web3Reader };

MusicoinCore.prototype.getArtist = function(address) {
  return this.artistModule.getArtist(address);
};

MusicoinCore.prototype.getLicense = function(address) {
  return this.licenseModule.getLicense(address);
};

MusicoinCore.prototype.getTransactionDetails = function(hash) {
  return this.txModule.getTransactionDetails(hash);
};

MusicoinCore.prototype.getLicenseResourceStream = function(address) {
  return this.licenseModule.getResourceStream(address);
};

module.exports = MusicoinCore;


