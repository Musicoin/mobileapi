const Promise = require('bluebird');
const request = require('request');

function ArtistModule(web3Reader, web3Writer) {
  this.web3Reader = web3Reader;
  this.web3Writer = web3Writer;
};

ArtistModule.prototype.getArtistByProfile = function(profileAddress) {
  return this.web3Reader.getArtistByProfile(profileAddress);
};

ArtistModule.prototype.sendFromProfile = function(profileAddress, recipient, musicoins) {
  return this.web3Writer.sendFromProfile(profileAddress, recipient, musicoins);
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
