const Constant = require('../constant');
const MediaProvider = require('../../utils/media-provider-instance');

function responseData(release) {
  const directTipCount = release.directTipCount || 0;
  const directPlayCount = release.directPlayCount || 0;
  return {
    title: release.title,
    link: Constant.TRACK_BASE_URL + release.contractAddress,
    tx: release.tx,
    genres: release.genres,
    author: release.artistName,
    authorLink: Constant.ARTIST_BASE_URL + release.artistAddress,
    trackImg: MediaProvider.resolveIpfsUrl(release.imageUrl),
    trackDescription: release.description,
    directTipCount: directTipCount,
    directPlayCount: directPlayCount
  }
}

function responseList(releases) {
  return releases.filter(release => release !== undefined).map(responseData);
}

module.exports = {
  responseData,
  responseList
}