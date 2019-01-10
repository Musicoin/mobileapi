const LicenseKey = require('../../../db/core/key');
const LicenseModule = require('../../Kernel').musicoinCore.getLicenseModule();
const MediaProvider = require('../../../utils/media-provider-instance');

async function downloadTrack(Request, Response) {
  const address = Request.params.address;

  try {
    const licenseKey = await LicenseKey.findOne({
      licenseAddress: address
    }).exec();
  
    if (!licenseKey) {
      return Response.status(400).json({
        error: `licenseKey not found: ${address}`
      })
    }
  
    // load license
    const license = await LicenseModule.getLicense(address);
    if (!license) {
      return Response.status(400).json({
        error: `license not found: ${address}`
      })
    }
  
    const resourceUrl = license.resourceUrl;
  
    if (!resourceUrl) {
      return Response.status(400).json({
        error: `track resource not found: ${address}`
      })
    }
  
    const resource = await MediaProvider.getIpfsResource(resourceUrl, () => licenseKey.key);

    Response.sendSeekable(resource.stream, {
      type: { contentType: "audio/mpeg" },
      length: resource.headers['content-length']
    });
  } catch (error) {
    Response.status(500).json({
      error: error.message
    })
  }

}

module.exports = {
  downloadTrack
}