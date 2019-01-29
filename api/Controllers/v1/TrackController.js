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
      this.logger.debug(`load license key start`);
      const licenseKey = await this.TrackDelegator.getLicenseKey(address);
      this.logger.debug("load license key end:", licenseKey);
      if (!licenseKey) {
        return this.reject(Request, Response, `licenseKey not found: ${address}`);
      }

      // load license
      this.logger.debug(`load license info start`);
      const license = await this.TrackDelegator.loadLicense(address);
      if (!license) {
        return this.reject(Request, Response, `license not found: ${address}`);
      }
      this.logger.debug(`load license info end`);

      const resourceUrl = license.resourceUrl;

      if (!resourceUrl) {
        return this.reject(Request, Response, `track resource not found: ${address}`);
      }

      this.logger.debug(`load track resource start`);
      const resource = await this.MediaProvider.getIpfsResource(resourceUrl, () => licenseKey.key);
      this.logger.debug(`load track resource end`);

      try {
        this.logger.debug(`update track plays start`);
        const release = await this.db.Release.findOne({contractAddress: address});
        await this.TrackDelegator.increaseTrackPlays(address);
        await this.TrackDelegator.increaseTrackPlayStats(release._id)
        this.logger.debug(`update track plays end`);
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