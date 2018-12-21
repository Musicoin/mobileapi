const MediaProvider = require('../../../utils/media-provider-instance');

async function getArtistDescription(Request, Response) {
  try {
    const descUrl = "ipfs://"+Request.params.hash;
    const text = await MediaProvider.fetchTextFromIpfs(descUrl);
    Response.status(200).json({
      success: true,
      data: text
    })
  } catch (error) {
    Response.status(500).json({
      error: error.message
    })
  }
}

module.exports = {
  getArtistDescription
}