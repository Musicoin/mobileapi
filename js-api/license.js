const Promise = require('bluebird');
const Limit = require('../components/media/limit-transform');
const Lock = require('../components/media/media-lock');

function LicenseModule(web3Reader, web3Writer, mediaProvider) {
  this.web3Reader = web3Reader;
  this.web3Writer = web3Writer;
  this.mediaProvider = mediaProvider;
};

/**
 * @param {string} address
 * @returns {*|Promise.<TResult>}
 */
LicenseModule.prototype.getLicense = function(address) {
  return this.web3Reader.loadLicense(address)
    .bind(this)
    .then(function(license) {
      license.image = this.mediaProvider.resolveIpfsUrl(license.imageUrl);
      return license;
    });
};

LicenseModule.prototype.sampleResourceStream = function(address, percentage) {
  return this.getResourceStream(address)
    .then(function(result) {
      const length = result.headers["content-length"];
      const max = Math.floor(length * (percentage / 100.0));
      result.headers["content-length"] = max;
      result.stream = result.stream.pipe(new Limit(max));
      return result;
    })
};

LicenseModule.prototype.getResourceStream = function(address) {
  return this.getLicense(address)
    .then(function(license) {
      return this.mediaProvider.getIpfsResource(license.resourceUrl, function () {
        const resourceSeed = license.resourceSeed ? license.resourceSeed : license.artist + " " + license.title;
        return Lock.computeKey(resourceSeed);
      })
    }.bind(this))
};

LicenseModule.prototype.releaseLicense = function(releaseRequest, credentialsProvider) {
  return this.web3Writer.releaseLicenseV5(releaseRequest, credentialsProvider);
};

LicenseModule.prototype.getWeb3Reader = function() {
  return this.web3Reader;
};


module.exports = LicenseModule;
