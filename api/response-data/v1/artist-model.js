const MediaProvider = require('../../../utils/media-provider-instance');

function responseData(artist) {
  return {
    profileAddress: artist.profileAddress,
    description: artist.draftProfile.description,
    artistName: artist.draftProfile.artistName,
    imageUrl: MediaProvider.resolveIpfsUrl(artist.draftProfile.ipfsImageUrl),
    social: artist.draftProfile.social,
    followers: artist.followerCount || 0,
    tipCount: artist.directTipCount || 0
  }
}

function responseMore(contractInfo, artist) {
  return {
    profileAddress: artist.profileAddress,
    description: contractInfo.description,
    artistName: contractInfo.artistName,
    imageUrl: MediaProvider.resolveIpfsUrl(contractInfo.imageUrl),
    social: contractInfo.social,
    followers: artist.followerCount || 0,
    tipCount: artist.directTipCount || 0
  }
}

function responseList(artists) {
  return artists.map(artist=>responseData(artist));
}

module.exports = {
  responseData,
  responseList,
  responseMore
}