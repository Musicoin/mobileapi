const Web3Reader = require('./components/blockchain/web3-reader');
const Web3Writer = require('./components/blockchain/web3-writer');
const MediaProvider = require('./components/media/media-provider');
const ArtistModule = require('./js-api/artist');
const LicenseModule = require('./js-api/license');
const TxModule = require('./js-api/tx');
const Web3 = require('web3');

function MusicoinCore(config) {
  this.web3 = new Web3();
  this.web3.setProvider(new this.web3.providers.HttpProvider(config.web3Host));
  this.web3Reader = new Web3Reader(this.web3);
  this.web3Writer = new Web3Writer(this.web3, this.web3Reader);
  this.mediaProvider = new MediaProvider(config.ipfsHost);

  this.artistModule = new ArtistModule(this.web3Reader, this.mediaProvider);
  this.licenseModule = new LicenseModule(this.web3Reader, this.mediaProvider);
  this.txModule = new TxModule(this.web3Reader, this.mediaProvider);
}

MusicoinCore.prototype.getArtistModule = function() { return this.artistModule };
MusicoinCore.prototype.getLicenseModule = function() {  return this.licenseModule };
MusicoinCore.prototype.getTxModule = function() {  return this.txModule };
MusicoinCore.prototype.getMediaProvider = function() {  return this.mediaProvider };
MusicoinCore.prototype.getWeb3Reader = function() {  return this.web3Reader };
MusicoinCore.prototype.getWeb3Writer = function() {  return this.web3Writer };

MusicoinCore.prototype.getArtist = function(address) {
  return this.artistModule.getArtistByOwner(address);
};

MusicoinCore.prototype.getArtistReleases = function(address) {
  return this.artistModule.loadReleases(address);
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

MusicoinCore.prototype.sendTip = function(licenseAddress, amountInWei, credentialProvider) {
  return this.web3Writer.tipLicense(licenseAddress, amountInWei, credentialProvider);
};

MusicoinCore.prototype.sendPPP = function(licenseAddress, credentialProvider) {
  return this.web3Writer.ppp(licenseAddress, credentialProvider);
};

MusicoinCore.prototype.setCredentialsProvider = function(provider) {
  this.web3Writer.setCredentialsProvider(provider);
};

MusicoinCore.prototype.setCredentials = function(account, pwd) {
  this.web3Writer.setCredentialsProvider(Web3Writer.createInMemoryCredentialsProvider(account, pwd));
};

module.exports = MusicoinCore;


