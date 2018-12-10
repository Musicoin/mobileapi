const Constant = require('../constant');
const MediaProvider = require('../../utils/media-provider-instance');

function responseData(artist) {
  return {
    createdBy: artist.createdBy,
    forwardingAddress: artist.forwardingAddress,
    descriptionUrl: MediaProvider.resolveIpfsUrl(artist.descriptionUrl),
    artistName: artist.artistName,
    owner: artist.owner,
    contractVersion: artist.contractVersion,
    imageUrl: MediaProvider.resolveIpfsUrl(artist.imageUrl),
    socialUrl: MediaProvider.resolveIpfsUrl(artist.socialUrl),
    followers: artist.followers || 0,
    tipTotal: artist.tipTotal || 0,
    tipCount: artist.tipCount || 0,
    balance: artist.balance || 0
  }
}

function responseList(artists) {
  return artists.filter(artist => artist !== undefined).map(responseData);
}

module.exports = {
  responseData,
  responseList
}