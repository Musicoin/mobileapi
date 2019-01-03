const Constant = require('../constant');
const MediaProvider = require('../../utils/media-provider-instance');
const RESOURCE_BASE_URL = "https://musicoin.org";
const URLUtil = require('../../utils/url-utils');
const TIMEOUT = 3*60*1000;

function responseData(release) {
  return {
    trackAddress: release.contractAddress,
    title: release.title,
    tx: release.tx,
    genres: release.genres,
    artistName: release.artistName,
    artistAddress: release.artistAddress,
    trackImg: MediaProvider.resolveIpfsUrl(release.imageUrl),
    // trackUrl: `${Constant.PLAY_BASE_URL}/${release.contractAddress}/index.m3u8`,
    trackUrl: `${RESOURCE_BASE_URL}/ppp/${URLUtil.createExpiringLink(release.contractAddress, TIMEOUT)}`,
    trackDescription: release.description,
    directTipCount: release.directTipCount || 0,
    directPlayCount: release.directPlayCount || 0
  }
}

function responseList(releases) {
  return releases.filter(release => release && release.contractAddress).map(responseData);
}

module.exports = {
  responseData,
  responseList
}
