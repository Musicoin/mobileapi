const Constant = require('../constant');
const MediaProvider = require('../../utils/media-provider-instance');
const RESOURCE_BASE_URL = "https://musicoin.org/";
const URLUtil = require('../../utils/url-utils');
const TIMEOUT = 3*60*1000;

function responseData(release) {
  const directTipCount = release.directTipCount || 0;
  const directPlayCount = release.directPlayCount || 0;
  return {
    trackId: release.contractAddress,
    title: release.title,
    link: Constant.TRACK_BASE_URL + release.contractAddress,
    tx: release.tx,
    genres: release.genres,
    author: release.artistName,
    authorLink: Constant.ARTIST_BASE_URL + release.artistAddress,
    trackImg: MediaProvider.resolveIpfsUrl(release.imageUrl),
    trackUrl: RESOURCE_BASE_URL+"ppp/"+URLUtil.createExpiringLink(release.contractAddress,TIMEOUT),
    trackDescription: release.description,
    directTipCount: directTipCount,
    directPlayCount: directPlayCount
  }
}

function responseList(releases) {
  return releases.filter(release => release && release.contractAddress).map(responseData);
}

module.exports = {
  responseData,
  responseList
}