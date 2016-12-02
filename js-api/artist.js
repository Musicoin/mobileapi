var Promise = require('bluebird');

function ArtistModule(web3Reader, mediaProvider) {
  this.web3Reader = web3Reader;
  this.mediaProvider = mediaProvider;
}

ArtistModule.prototype.getArtistByOwner = function(ownerAddress) {
  return this._getArtistDetails(this.web3Reader.getArtistByOwner(ownerAddress))
};

ArtistModule.prototype.getArtistByProfile = function(profileAddress) {
  return this._getArtistDetails(this.web3Reader.getArtistByProfile(profileAddress))
};

ArtistModule.prototype._getArtistDetails = function(profile) {
  return profile
    .then(function(result) {
      var d = this.mediaProvider.readTextFromIpfs(result.descriptionUrl);
      var s = this.mediaProvider.readJsonFromIpfs(result.socialUrl);
      return Promise.join(d, s, function(description, social) {
        result.description = description;
        result.social = social;
        result.image = this.mediaProvider.resolveIpfsUrl(result.imageUrl);
        return result;
      }.bind(this))
    }.bind(this))
};

module.exports = ArtistModule;
