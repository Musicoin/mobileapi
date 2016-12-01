var Promise = require('bluebird');

function ArtistModule(web3Reader, mediaProvider) {
  this.web3Reader = web3Reader;
  this.mediaProvider = mediaProvider;
}

ArtistModule.prototype.getArtist = function(address) {
  return this.web3Reader.getArtist(address)
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
