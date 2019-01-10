const LicenseKey = require('../../../db/core/key');
const LicenseModule = require('../../Kernel').musicoinCore.getLicenseModule();
const MediaProvider = require('../../../utils/media-provider-instance');
const request = require('request');
const CLIENT_ID = "OLDjonAeYPx6ZVKaMD3a";
const logger = require('../../../utils/Logger');

function getLicenseKey(licenseAddress) {
  return new Promise((resolve, reject)=>{
    request({
      url: `http://35.186.250.94/license/ppp/${licenseAddress}`,
      json: true,
      headers: {
        clientID: CLIENT_ID
      }
    }, function (error, response, result) {
      if (error) {
        logger.debug("get license key error: ",error);
        reject(error);
      }else if (response.statusCode != 200) {
        reject("not found");
      }else{
        resolve(result);
      }
    })
  })
}

async function downloadTrack(Request, Response) {
  const address = Request.params.address;

  try {
    const licenseKey = await getLicenseKey(address);
    
    logger.debug("license key:",licenseKey);
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
      type: "audio/mp3",
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