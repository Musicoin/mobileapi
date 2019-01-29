const BaseController = require('../base/BaseController');
const TrackDelegator = require('../../Delegator/TrackDelegator');

class TrackController extends BaseController {
  constructor(props) {
    super(props);

    this.TrackDelegator = new TrackDelegator(props);

    this.downloadTrack = this.downloadTrack.bind(this);
  }

  async downloadTrack(Request, Response, next) {
    const address = Request.params.address;

    try {
      const licenseKey = await this.TrackDelegator.getLicenseKey(address);

      this.logger.debug("license key:", licenseKey);
      if (!licenseKey) {
        return this.reject(Request, Response, `licenseKey not found: ${address}`);
      }

      // load license
      const license = await this.TrackDelegator.loadLicense(address);
      if (!license) {
        return this.reject(Request, Response, `license not found: ${address}`);
      }

      const resourceUrl = license.resourceUrl;

      if (!resourceUrl) {
        return this.reject(Request, Response, `track resource not found: ${address}`);
      }

      const resource = await this.MediaProvider.getIpfsResource(resourceUrl, () => licenseKey.key);
      try {
        await this.TrackDelegator.increaseTrackPlays(address);
      } catch (error) {
        this.logger.error("increase release plays error:", error.message);
      }

      const data = {
        stream: resource.stream,
        options: {
          type: "audio/mp3",
          length: resource.headers['content-length']
        }
      }

      this.success(Request, Response, next, data);
    } catch (error) {
      this.error(Request, Response, error)
    }

  }
}

module.exports = TrackController;