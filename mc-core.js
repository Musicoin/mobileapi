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

MusicoinCore.prototype.loadArtist = function(address) {
  return this.artistModule.loadArtist(address);
};

MusicoinCore.prototype.getLicense = function(address) {
  return this.licenseModule.getLicense(address);
};

MusicoinCore.prototype.getResource = function(address) {
  return this.licenseModule.getResource(address);
};

MusicoinCore.prototype.loadTransactionDetails = function(hash) {
  return this.txModule.loadTransactionDetails(hash);
};

module.exports = MusicoinCore;