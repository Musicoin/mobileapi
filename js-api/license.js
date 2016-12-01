const crypto = require('crypto');
const constant = '36e6f1d1cd2ff2cd7bb75a359';

function LicenseModule(_web3Reader, _mediaProvider) {
  this.web3Reader = _web3Reader;
  this.mediaProvider = _mediaProvider;
}

LicenseModule.prototype.getLicense = function(address) {
  return this.web3Reader.loadLicense(address)
    .bind(this)
    .then(function(license) {
      license.image = this.mediaProvider.resolveIpfsUrl(license.imageUrl);
      return license;
    });
};

LicenseModule.prototype.getResource = function(address) {
  return this.getLicense(address)
    .then(function(license) {
      return this.mediaProvider.getIpfsResource(license.resourceUrl, function () {
        return _computeKey(license.artist, license.title);
      })
    }.bind(this))
};

const _computeKey = function(v1, v2) {
  const seed = v1 + " " + v2 + " " + constant;
  return crypto.createHash('md5').update(seed).digest("hex");
};

module.exports = LicenseModule;
